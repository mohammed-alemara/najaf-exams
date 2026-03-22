import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json({ limit: '50mb' }));

  // API Proxy Route for Google Sheets
  app.post('/api/sync', async (req, res) => {
    const { scriptUrl, data } = req.body;

    if (!scriptUrl || !data) {
      return res.status(400).json({ status: 'error', message: 'Missing scriptUrl or data' });
    }

    try {
      console.log(`Proxying request to Google Apps Script: ${scriptUrl}`);
      
      const response = await axios.post(scriptUrl, data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000,
        maxRedirects: 5, // Ensure we follow redirects
      });

      console.log('Google Response Status:', response.status);
      const googleData = response.data;
      console.log('Raw Response from Google (first 200 chars):', typeof googleData === 'string' ? googleData.substring(0, 200) : 'Object received');

      // Check if the response is actually JSON
      let parsedData = googleData;
      if (typeof googleData === 'string') {
        try {
          parsedData = JSON.parse(googleData);
        } catch (e) {
          console.log('Response is not JSON string, it might be HTML or already parsed object');
        }
      }

      if (parsedData && typeof parsedData === 'object' && parsedData.status === 'success') {
        console.log('Sync Success confirmed by Google Script');
        return res.json({ 
          status: 'success', 
          message: parsedData.message || 'تم تأكيد الإرسال بنجاح' 
        });
      } else if (parsedData && parsedData.status === 'error') {
        console.error('Sync Error from Google Script:', parsedData.message);
        return res.status(500).json({ 
          status: 'error', 
          message: `خطأ من السكربت: ${parsedData.message}` 
        });
      } else {
        console.warn('Unexpected response format from Google');
        const errorSnippet = typeof googleData === 'string' ? googleData.substring(0, 100) : 'رد غير معروف';
        return res.status(500).json({ 
          status: 'error', 
          message: `رد غير صالح من جوجل (تأكد من نشر السكربت كـ Web App): ${errorSnippet}` 
        });
      }
    } catch (error: any) {
      console.error('Proxy error details:', error.message);
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
      }
      
      let errorMessage = 'فشل الاتصال بـ Google Sheets';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `خطأ من Google: ${error.response.status} - ${error.response.statusText}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'لم يتم استلام رد من Google Sheets (تأكد من الرابط)';
      }

      return res.status(500).json({ status: 'error', message: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
