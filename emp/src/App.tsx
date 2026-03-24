/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Printer, 
  BarChart3, 
  Users, 
  LogOut, 
  LogIn, 
  School, 
  UserPlus, 
  Filter, 
  ChevronRight, 
  ChevronLeft,
  X,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  User,
  Timestamp
} from './firebase';
import { cn } from './lib/utils';

// --- Types ---
interface Teacher {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  school: string;
  hireDate?: string;
  status: 'active' | 'inactive';
  uid: string;
  createdAt?: any;
}

// --- Components ---

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className, 
  disabled,
  type = 'button'
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; 
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-50'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  required,
  className 
}: { 
  label?: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  type?: string; 
  placeholder?: string;
  required?: boolean;
  className?: string;
}) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
    />
  </div>
);

const Select = ({ 
  label, 
  value, 
  onChange, 
  options, 
  required 
}: { 
  label?: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; 
  options: { label: string; value: string }[];
  required?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [view, setView] = useState<'list' | 'stats' | 'add' | 'edit'>('list');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    school: '',
    hireDate: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isAuthReady) return;

    const q = query(
      collection(db, 'teachers'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Teacher[];
      setTeachers(data);
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (view === 'edit' && editingTeacher) {
        const teacherRef = doc(db, 'teachers', editingTeacher.id);
        await updateDoc(teacherRef, {
          ...formData,
          updatedAt: Timestamp.now()
        });
      } else {
        await addDoc(collection(db, 'teachers'), {
          ...formData,
          uid: user.uid,
          createdAt: Timestamp.now()
        });
      }
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        school: '',
        hireDate: '',
        status: 'active'
      });
      setView('list');
      setEditingTeacher(null);
    } catch (error) {
      console.error("Submit Error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المعلم؟')) return;
    try {
      await deleteDoc(doc(db, 'teachers', id));
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email || '',
      phone: teacher.phone || '',
      subject: teacher.subject,
      school: teacher.school,
      hireDate: teacher.hireDate || '',
      status: teacher.status
    });
    setView('edit');
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterSubject === 'All' || t.subject === filterSubject;
      return matchesSearch && matchesFilter;
    });
  }, [teachers, searchTerm, filterSubject]);

  const subjects = useMemo(() => {
    const s = new Set(teachers.map(t => t.subject));
    return ['All', ...Array.from(s)];
  }, [teachers]);

  const statsData = useMemo(() => {
    const subjectCounts: { [key: string]: number } = {};
    teachers.forEach(t => {
      subjectCounts[t.subject] = (subjectCounts[t.subject] || 0) + 1;
    });
    return Object.entries(subjectCounts).map(([name, value]) => ({ name, value }));
  }, [teachers]);

  const statusData = useMemo(() => {
    const active = teachers.filter(t => t.status === 'active').length;
    const inactive = teachers.filter(t => t.status === 'inactive').length;
    return [
      { name: 'نشط', value: active, color: '#10B981' },
      { name: 'غير نشط', value: inactive, color: '#EF4444' }
    ];
  }, [teachers]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <School className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">نظام إدارة المعلمين</h1>
          <p className="text-gray-600 mb-8">يرجى تسجيل الدخول للوصول إلى النظام وإدارة بيانات المعلمين.</p>
          <Button onClick={handleLogin} className="w-full py-3 text-lg">
            <LogIn className="w-5 h-5" />
            تسجيل الدخول باستخدام Google
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <School className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">نظام إدارة المعلمين</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full" />
                <span className="text-sm font-medium text-gray-700">{user.displayName}</span>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 print:hidden">
          <Button 
            variant={view === 'list' ? 'primary' : 'secondary'} 
            onClick={() => setView('list')}
          >
            <Users className="w-5 h-5" />
            قائمة المعلمين
          </Button>
          <Button 
            variant={view === 'stats' ? 'primary' : 'secondary'} 
            onClick={() => setView('stats')}
          >
            <BarChart3 className="w-5 h-5" />
            الإحصائيات
          </Button>
          <Button 
            variant={view === 'add' ? 'primary' : 'secondary'} 
            onClick={() => {
              setEditingTeacher(null);
              setFormData({
                name: '', email: '', phone: '', subject: '', school: '', hireDate: '', status: 'active'
              });
              setView('add');
            }}
          >
            <UserPlus className="w-5 h-5" />
            إضافة معلم
          </Button>
          <div className="flex-1" />
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="w-5 h-5" />
            طباعة
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Search & Filter */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 print:hidden">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="بحث بالاسم، المدرسة، أو التخصص..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400 w-5 h-5" />
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    {subjects.map(s => (
                      <option key={s} value={s}>{s === 'All' ? 'كل التخصصات' : s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">الاسم</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">التخصص</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">المدرسة</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">الحالة</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 print:hidden">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredTeachers.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{teacher.name}</div>
                            <div className="text-xs text-gray-500">{teacher.email || teacher.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{teacher.subject}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{teacher.school}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-xs font-medium",
                              teacher.status === 'active' 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                            )}>
                              {teacher.status === 'active' ? 'نشط' : 'غير نشط'}
                            </span>
                          </td>
                          <td className="px-6 py-4 print:hidden">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleEdit(teacher)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(teacher.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredTeachers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            لا يوجد معلمين مطابقين للبحث
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Summary Cards */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-sm font-medium text-gray-500 mb-1">إجمالي المعلمين</div>
                  <div className="text-3xl font-bold text-gray-900">{teachers.length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-sm font-medium text-gray-500 mb-1">المعلمون النشطون</div>
                  <div className="text-3xl font-bold text-green-600">
                    {teachers.filter(t => t.status === 'active').length}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-sm font-medium text-gray-500 mb-1">عدد التخصصات</div>
                  <div className="text-3xl font-bold text-blue-600">{subjects.length - 1}</div>
                </div>
              </div>

              {/* Charts */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
                <h3 className="text-lg font-bold text-gray-900 mb-6">توزيع المعلمين حسب التخصص</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
                <h3 className="text-lg font-bold text-gray-900 mb-6">حالة المعلمين</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {statusData.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {(view === 'add' || view === 'edit') && (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {view === 'edit' ? 'تعديل بيانات معلم' : 'إضافة معلم جديد'}
                  </h2>
                  <button 
                    onClick={() => setView('list')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="الاسم الكامل"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="أدخل اسم المعلم"
                      required
                      className="sm:col-span-2"
                    />
                    <Input
                      label="البريد الإلكتروني"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@mail.com"
                    />
                    <Input
                      label="رقم الهاتف"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="05xxxxxxxx"
                    />
                    <Input
                      label="التخصص"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="مثال: رياضيات، لغة عربية"
                      required
                    />
                    <Input
                      label="المدرسة"
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      placeholder="اسم المدرسة الحكومية"
                      required
                    />
                    <Input
                      label="تاريخ التعيين"
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    />
                    <Select
                      label="الحالة"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      options={[
                        { label: 'نشط', value: 'active' },
                        { label: 'غير نشط', value: 'inactive' }
                      ]}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1 py-3">
                      {view === 'edit' ? 'حفظ التعديلات' : 'إضافة المعلم'}
                    </Button>
                    <Button variant="secondary" onClick={() => setView('list')} className="px-8">
                      إلغاء
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Print View Styling */}
      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: right; }
          header, nav, button { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
          .shadow-sm, .border { border: none !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
