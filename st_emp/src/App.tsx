import React, { useState, useMemo, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  ChevronLeft, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Menu, 
  X,
  Plus,
  Save,
  ArrowRight,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
interface StaffMember {
  id: string;
  name: string;
  motherName: string;
  staffType: string;
  gender: 'ذكر' | 'أنثى';
  birthYear: string;
  age: number;
  ageClass: string;
  job: string;
  salary: string;
  grade: string;
  college: string;
  degree: string;
  specialty: string;
  gradYear: string;
  hireDate: string;
  serviceYears: string;
  serviceClass: string;
  returnDate: string;
  maritalStatus: string;
  status: 'مباشر' | 'مجاز' | 'متقاعد';
  courseParticipation: string;
  notes: string;
  phone: string;
}

const INITIAL_STAFF: StaffMember[] = [
  { 
    id: '1', 
    name: 'أحمد محمد علي', 
    motherName: 'فاطمة حسن',
    staffType: 'ملاك دائم',
    gender: 'ذكر',
    birthYear: '1985',
    age: 39,
    ageClass: '30-40',
    job: 'مدير المدرسة', 
    salary: '850,000',
    grade: 'الثانية',
    college: 'كلية التربية',
    degree: 'ماجستير',
    specialty: 'إدارة تربوية', 
    gradYear: '2008',
    hireDate: '2010-09-01', 
    serviceYears: '14',
    serviceClass: 'أ',
    returnDate: '-',
    maritalStatus: 'متزوج',
    status: 'مباشر', 
    courseParticipation: 'دورة الإدارة الحديثة',
    notes: 'لا يوجد',
    phone: '07701234567' 
  },
];

const POSITIONS = ['مدير المدرسة', 'معاون مدير', 'معلم جامعي', 'معلم', 'موظف خدمة', 'حارس'];
const STAFF_TYPES = ['ملاك دائم', 'عقد الوزارة', 'محاضر مجاني'];
const DEGREES = ['دكتوراه', 'ماجستير', 'دبلوم عالي', 'بكالوريوس', 'دبلوم', 'إعدادية'];
const MARITAL_STATUSES = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];

export default function App() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'add'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [scriptUrl, setScriptUrl] = useState('https://script.google.com/macros/s/AKfycby0M58HBNdh1grmWbbLQvbryyL-zUnmM67mEvcepHbMIzfa04yMZuWZOT__LQXD_pKh/exec');
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => {
    const total = staff.length;
    const active = staff.filter(s => s.status === 'مباشر').length;
    const onLeave = staff.filter(s => s.status === 'مجاز').length;
    
    const bySubject = staff.reduce((acc, s) => {
      acc[s.specialty] = (acc[s.specialty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPosition = staff.reduce((acc, s) => {
      acc[s.job] = (acc[s.job] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, active, onLeave, bySubject, byPosition };
  }, [staff]);

  const filteredStaff = useMemo(() => {
    return staff.filter(s => 
      s.name.includes(searchTerm) || 
      s.specialty.includes(searchTerm) || 
      s.job.includes(searchTerm)
    );
  }, [staff, searchTerm]);

  const handleAddOrUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const birthYear = parseInt(formData.get('birthYear') as string);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    
    const newMember: StaffMember = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      motherName: formData.get('motherName') as string,
      staffType: formData.get('staffType') as string,
      gender: formData.get('gender') as any,
      birthYear: birthYear.toString(),
      age: age,
      ageClass: age < 30 ? 'تحت 30' : age < 45 ? '30-45' : 'فوق 45',
      job: formData.get('job') as string,
      salary: formData.get('salary') as string,
      grade: formData.get('grade') as string,
      college: formData.get('college') as string,
      degree: formData.get('degree') as string,
      specialty: formData.get('specialty') as string,
      gradYear: formData.get('gradYear') as string,
      hireDate: formData.get('hireDate') as string,
      serviceYears: formData.get('serviceYears') as string,
      serviceClass: formData.get('serviceClass') as string,
      returnDate: formData.get('returnDate') as string,
      maritalStatus: formData.get('maritalStatus') as string,
      status: formData.get('status') as any,
      courseParticipation: formData.get('courseParticipation') as string,
      notes: formData.get('notes') as string,
      phone: formData.get('phone') as string,
    };

    if (editingId) {
      setStaff(prev => prev.map(s => s.id === editingId ? newMember : s));
      setEditingId(null);
      showNotification('success', 'تم تحديث بيانات الموظف بنجاح');
    } else {
      setStaff(prev => [...prev, newMember]);
      showNotification('success', 'تمت إضافة الموظف الجديد بنجاح');
    }
    setActiveTab('list');
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const [isLocked, setIsLocked] = useState(false);

  const syncWithGoogleSheets = async () => {
    if (!scriptUrl) {
      const url = window.prompt('يرجى إدخال رابط السكربت (Web App URL) الخاص بـ Google Sheets:');
      if (url) setScriptUrl(url);
      else return;
    }

    setIsSyncing(true);
    showNotification('info', 'جاري الاتصال بـ Google Sheets والتحقق من سلامة الملف...');

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptUrl: scriptUrl,
          data: {
            school: 'مدرسة التميز',
            employees: staff,
            timestamp: new Date().toLocaleString('ar-IQ')
          }
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        const now = new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
        setLastSynced(now);
        showNotification('success', `تم التأكيد! البيانات وصلت للشيت بنجاح في تمام الساعة ${now}. تم قفل الاستمارة.`);
        setIsLocked(true);
      } else {
        throw new Error(result.message || 'فشل السيرفر في معالجة الطلب');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      showNotification('error', `فشل الإرسال الحقيقي: ${error.message || 'تأكد من وجود الملف وصلاحية السكربت.'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteMember = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      setStaff(prev => prev.filter(s => s.id !== id));
    }
  };

  const exportToCSV = () => {
    const headers = ['الاسم', 'العنوان الوظيفي', 'الاختصاص', 'التحصيل الدراسي', 'تاريخ المباشرة', 'الحالة', 'رقم الهاتف'];
    const rows = staff.map(s => [s.name, s.position, s.subject, s.qualification, s.joinDate, s.status, s.phone]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "staff_report.csv");
    link.click();
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans flex flex-row-reverse" dir="rtl">
      {/* Sidebar */}
      <aside className={cn(
        "bg-[#151619] text-white transition-all duration-300 flex flex-col sticky top-0 h-screen",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-xl font-bold tracking-tight">نظام الملاكات</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="لوحة التحكم" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label="قائمة الملاكات" 
            active={activeTab === 'list'} 
            onClick={() => setActiveTab('list')} 
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={<UserPlus size={20} />} 
            label="إضافة موظف" 
            active={activeTab === 'add'} 
            onClick={() => { 
              if (isLocked) {
                showNotification('info', 'الاستمارة مقفولة بعد الإرسال، لا يمكن الإضافة حالياً.');
                return;
              }
              setActiveTab('add'); 
              setEditingId(null); 
            }} 
            collapsed={!isSidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-white/10">
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="الإعدادات" 
            collapsed={!isSidebarOpen}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {activeTab === 'dashboard' && 'نظرة عامة على الملاكات'}
              {activeTab === 'list' && 'إدارة الملاكات التربوية'}
              {activeTab === 'add' && (editingId ? 'تعديل بيانات موظف' : 'إضافة موظف جديد')}
            </h2>
          </div>
          <div className="flex items-center gap-3 no-print">
            <button 
              onClick={printReport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              <Printer size={16} />
              طباعة
            </button>
            <div className="flex flex-col items-end">
              <button 
                onClick={syncWithGoogleSheets}
                disabled={isSyncing}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-[#151619] text-white rounded-lg hover:bg-black text-sm font-medium transition-colors",
                  isSyncing && "opacity-50 cursor-not-allowed"
                )}
              >
                <Save size={16} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? 'جاري الإرسال...' : 'إرسال لـ Google Sheets'}
              </button>
              {lastSynced && (
                <span className="text-[10px] text-green-600 font-medium mt-1">
                  آخر مزامنة: {lastSynced}
                </span>
              )}
            </div>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#151619] text-white rounded-lg hover:bg-black text-sm font-medium transition-colors"
            >
              <Download size={16} />
              تصدير بيانات
            </button>
          </div>
        </header>

        {/* Notifications */}
        {notification && (
          <div className={cn(
            "mx-8 mt-4 p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300",
            notification.type === 'success' ? "bg-green-50 text-green-800 border border-green-200" : 
            notification.type === 'error' ? "bg-red-50 text-red-800 border border-red-200" : 
            "bg-blue-50 text-blue-800 border border-blue-200"
          )}>
            <div className="flex items-center gap-3">
              {notification.type === 'success' && <div className="w-2 h-2 rounded-full bg-green-500" />}
              {notification.type === 'error' && <div className="w-2 h-2 rounded-full bg-red-500" />}
              {notification.type === 'info' && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="إجمالي الملاكات" value={stats.total} icon={<Users className="text-blue-600" />} />
                <StatCard label="المباشرين فعلياً" value={stats.active} icon={<div className="w-3 h-3 rounded-full bg-green-500" />} />
                <StatCard label="المجازين" value={stats.onLeave} icon={<div className="w-3 h-3 rounded-full bg-orange-500" />} />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-6 flex items-center gap-2 italic">
                    <PieChartIcon size={16} />
                    توزيع الملاكات حسب العنوان الوظيفي
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(stats.byPosition).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {Object.entries(stats.byPosition).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#151619', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-6 flex items-center gap-2 italic">
                    <BarChartIcon size={16} />
                    توزيع الملاكات حسب الاختصاص
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(stats.bySubject).map(([name, value]) => ({ name, value }))}>
                        <XAxis dataKey="name" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#151619" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity / Table Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-semibold">آخر المضافين</h3>
                  <button onClick={() => setActiveTab('list')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    عرض الكل
                    <ChevronLeft size={14} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3 font-medium">الاسم</th>
                        <th className="px-6 py-3 font-medium">العنوان الوظيفي</th>
                        <th className="px-6 py-3 font-medium">الاختصاص</th>
                        <th className="px-6 py-3 font-medium">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {staff.slice(-3).reverse().map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">{member.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{member.job}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{member.specialty}</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={member.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Filters & Search */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="بحث بالاسم أو الاختصاص..." 
                    className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                    <Filter size={16} />
                    تصفية
                  </button>
                  <button 
                    onClick={() => { 
                      if (isLocked) {
                        showNotification('info', 'الاستمارة مقفولة بعد الإرسال، لا يمكن الإضافة حالياً.');
                        return;
                      }
                      setActiveTab('add'); 
                      setEditingId(null); 
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#151619] text-white rounded-lg hover:bg-black text-sm"
                  >
                    <Plus size={16} />
                    إضافة جديد
                  </button>
                </div>
              </div>

              {/* Main Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-medium">الاسم</th>
                        <th className="px-6 py-4 font-medium">العنوان الوظيفي</th>
                        <th className="px-6 py-4 font-medium">الاختصاص</th>
                        <th className="px-6 py-4 font-medium">التحصيل</th>
                        <th className="px-6 py-4 font-medium">المباشرة</th>
                        <th className="px-6 py-4 font-medium">الحالة</th>
                        <th className="px-6 py-4 font-medium no-print">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStaff.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{member.name}</span>
                              <span className="text-xs text-gray-400">{member.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{member.job}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{member.specialty}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{member.degree}</td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-500">{member.hireDate}</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={member.status} />
                          </td>
                          <td className="px-6 py-4 no-print">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => { 
                                  if (isLocked) {
                                    showNotification('info', 'الاستمارة مقفولة، لا يمكن التعديل.');
                                    return;
                                  }
                                  setEditingId(member.id); 
                                  setActiveTab('add'); 
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  if (isLocked) {
                                    showNotification('info', 'الاستمارة مقفولة، لا يمكن الحذف.');
                                    return;
                                  }
                                  deleteMember(member.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredStaff.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                            لا توجد نتائج تطابق بحثك...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <form onSubmit={handleAddOrUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">الاسم الثلاثي</label>
                      <input 
                        name="name" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.name : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">اسم الأم</label>
                      <input 
                        name="motherName" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.motherName : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">نوع الكادر</label>
                      <select 
                        name="staffType" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.staffType : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
                      >
                        {STAFF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">الجنس</label>
                      <select 
                        name="gender" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.gender : 'ذكر'}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
                      >
                        <option value="ذكر">ذكر</option>
                        <option value="أنثى">أنثى</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">سنة التولد</label>
                      <input 
                        name="birthYear" 
                        type="number"
                        min="1950"
                        max="2010"
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.birthYear : '1990'}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">العنوان الوظيفي</label>
                      <select 
                        name="job" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.job : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
                      >
                        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">الراتب الاسمي</label>
                      <input 
                        name="salary" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.salary : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">الدرجة</label>
                      <input 
                        name="grade" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.grade : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">الكلية/المعهد</label>
                      <input 
                        name="college" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.college : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">الشهادة</label>
                      <select 
                        name="degree" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.degree : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
                      >
                        {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">الاختصاص</label>
                      <input 
                        name="specialty" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.specialty : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">سنة التخرج</label>
                      <input 
                        name="gradYear" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.gradYear : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">تاريخ التعيين</label>
                      <input 
                        name="hireDate" 
                        type="date" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.hireDate : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">سنوات الخدمة</label>
                      <input 
                        name="serviceYears" 
                        type="number"
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.serviceYears : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">تصنيف الخدمة</label>
                      <input 
                        name="serviceClass" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.serviceClass : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">تاريخ العودة</label>
                      <input 
                        name="returnDate" 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.returnDate : '-'}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">الحالة الاجتماعية</label>
                      <select 
                        name="maritalStatus" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.maritalStatus : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
                      >
                        {MARITAL_STATUSES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">الحالة الوظيفية</label>
                      <select 
                        name="status" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.status : 'مباشر'}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
                      >
                        <option value="مباشر">مباشر</option>
                        <option value="مجاز">مجاز</option>
                        <option value="متقاعد">متقاعد</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>
                      <input 
                        name="phone" 
                        required 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.phone : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" 
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">الدورات المشارك بها</label>
                      <textarea 
                        name="courseParticipation" 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.courseParticipation : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none h-20" 
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">ملاحظات</label>
                      <textarea 
                        name="notes" 
                        defaultValue={editingId ? staff.find(s => s.id === editingId)?.notes : ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none h-20" 
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex gap-3">
                    <button 
                      type="submit" 
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#151619] text-white rounded-xl hover:bg-black font-medium transition-all"
                    >
                      <Save size={18} />
                      {editingId ? 'حفظ التعديلات' : 'إضافة الموظف'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('list')}
                      className="px-8 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          aside { display: none !important; }
          main { width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .p-8 { padding: 0 !important; }
          header { border: none !important; }
          .bg-[#F8F9FA] { background: white !important; }
          table { border: 1px solid #eee !important; }
          th { background: #f9f9f9 !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, collapsed }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean, 
  onClick?: () => void,
  collapsed?: boolean
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
        active ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5",
        collapsed && "justify-center px-0"
      )}
    >
      <span className={cn(active ? "text-blue-400" : "group-hover:text-white")}>{icon}</span>
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
      {active && !collapsed && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: number | string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1 italic">{label}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-xl">
        {icon}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: StaffMember['status'] }) {
  const configs = {
    active: { label: 'مباشر', class: 'bg-green-50 text-green-700 border-green-100' },
    'on-leave': { label: 'مجاز', class: 'bg-orange-50 text-orange-700 border-orange-100' },
    retired: { label: 'متقاعد', class: 'bg-gray-50 text-gray-700 border-gray-100' },
  };
  const config = configs[status];
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", config.class)}>
      {config.label}
    </span>
  );
}
