'use client';

import React, { useState, useMemo, useCallback } from 'react';

// === Mock Data (Teacher, Lessons, Availability, Reviews) ===
const TEACHER_PROFILE_INITIAL = {
  name: 'أحمد الحكيم',
  character: '🦉',
  subject: 'اللغة الهيروغليفية والقديمة',
  status: 'نشط',
  pricePerHour: 200,
  description: 'أهلاً بك في فصولي! أنا متخصص في تعليم الأطفال أساسيات اللغة المصرية القديمة (الهيروغليفية) من خلال الألعاب والقصص الممتعة. لدي خبرة 5 سنوات في التعليم التفاعلي للأطفال.',
  averageRating: 4.8,
  totalReviews: 45,
};

const UPCOMING_LESSONS = [
  { id: 201, date: '2025-12-05', time: '10:00 صباحاً', student: 'تحتمس الصغير', subject: 'مراجعة الهيروغليفية' },
  { id: 202, date: '2025-12-05', time: '02:00 مساءً', student: 'نفرتيتي المستقبل', subject: 'قراءة قصص فرعونية' },
  { id: 203, date: '2025-12-06', time: '09:30 صباحاً', student: 'سيت الصغير', subject: 'درس تأسيسي في القواعد' },
];

const MOCK_AVAILABILITY = [
  { id: 301, date: '2025-12-07', time: '04:00 مساءً', status: 'متاح للحجز' },
  { id: 302, date: '2025-12-07', time: '05:00 مساءً', status: 'متاح للحجز' },
  { id: 303, date: '2025-12-08', time: '06:00 مساءً', status: 'متاح للحجز' },
];

const MOCK_REVIEWS = [
  { id: 1, student: 'ملك الصغير', rating: 5, comment: 'شرح مبسط وممتع جداً، ابني أحب الهيروغليفية بفضله!', date: '2025-11-20' },
  { id: 2, student: 'توتو المبهج', rating: 4, comment: 'ممتاز ولكن قد يحتاج إلى المزيد من الأنشطة التفاعلية.', date: '2025-11-18' },
  { id: 3, student: 'حتحور الصغيرة', rating: 5, comment: 'المعلم أحمد حكيم بالفعل! ساعد ابنتي في فهم رموز صعبة.', date: '2025-11-15' },
];


export default function TeacherDashboardPage() {
  const [profile, setProfile] = useState(TEACHER_PROFILE_INITIAL);
  const [lessons, setLessons] = useState(UPCOMING_LESSONS);
  const [availability, setAvailability] = useState(MOCK_AVAILABILITY);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState({ description: profile.description, pricePerHour: profile.pricePerHour });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    try {
      return new Date(dateString + 'T12:00:00').toLocaleDateString('ar-EG', options);
    } catch (e) {
      return dateString;
    }
  };

  const groupedLessons = useMemo(() => {
    return lessons.reduce((acc: Record<string, any[]>, lesson) => {
      const dateKey = lesson.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(lesson);
      return acc;
    }, {});
  }, [lessons]);
  
  const groupedAvailability = useMemo(() => {
    return availability.reduce((acc: Record<string, any[]>, slot) => {
      const dateKey = slot.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(slot);
      return acc;
    }, {});
  }, [availability]);

  const addSlot = useCallback(() => {
    if (!newSlot.date || !newSlot.time) {
      setFeedback({ message: 'الرجاء إدخال التاريخ والوقت.', type: 'error' });
      return;
    }
    const newSlotItem = {
      id: Date.now(),
      date: newSlot.date,
      time: newSlot.time,
      status: 'متاح للحجز',
    };

    setAvailability(prev => [...prev, newSlotItem].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setNewSlot({ date: '', time: '' });
    setFeedback({ message: 'تم إضافة وقت جديد بنجاح!', type: 'success' });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  }, [newSlot]);

  const deleteSlot = useCallback((id: number) => {
    setAvailability(prev => prev.filter(slot => slot.id !== id));
    setFeedback({ message: 'تم حذف الوقت بنجاح.', type: 'success' });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  }, []);
  
  const saveProfile = useCallback(() => {
      if (!editData.description || !editData.pricePerHour) {
          setFeedback({ message: 'يرجى ملء جميع حقول الملف الشخصي.', type: 'error' });
          return;
      }
      setProfile(prev => ({ 
          ...prev, 
          description: editData.description, 
          pricePerHour: editData.pricePerHour 
      }));
      setIsEditingProfile(false);
      setFeedback({ message: 'تم تحديث الملف الشخصي بنجاح!', type: 'success' });
      setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  }, [editData]);


  const LessonCard = ({ lesson }: { lesson: any }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border-r-4 border-yellow-500 hover:shadow-lg transition-shadow" title={lesson.subject}>
      <p className="text-lg font-bold text-[#0d284e]">{lesson.time}</p>
      <p className="text-sm text-gray-600 truncate">{lesson.subject}</p>
      <p className="text-xs mt-1 text-gray-500">الطالب: <span className="font-semibold">{lesson.student}</span></p>
    </div>
  );
  
  const ReviewCard = ({ review }: { review: any }) => (
    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-400">
      <div className="flex justify-between items-center mb-1">
        <p className="font-bold text-sm text-[#17365e]">{review.student}</p>
        <div className="text-xs text-yellow-500">
            {Array.from({ length: 5 }, (_, i) => (
                <i key={i} className={`fas fa-star ${i < review.rating ? '' : 'text-gray-300'}`}></i>
            ))}
        </div>
      </div>
      <p className="text-sm text-gray-700 italic">{review.comment}</p>
      <p className="text-xs text-gray-400 mt-2 text-left">{review.date}</p>
    </div>
  );
  
  const AvailabilityCard = ({ slot }: { slot: any }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500 flex justify-between items-center">
      <div>
        <p className="text-lg font-bold text-gray-800">{slot.time}</p>
        <p className="text-sm text-green-600">{slot.status}</p>
      </div>
      <button 
        onClick={() => deleteSlot(slot.id)}
        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100"
        title="حذف الموعد"
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );


  return (
    <div className="min-h-screen bg-[#0d284e] p-4 md:p-10 flex items-start justify-center">
      <div className="w-full max-w-6xl bg-gray-100 rounded-xl shadow-2xl dashboard-container" style={{ direction: 'rtl' }}>
        
        <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 bg-[#17365e] rounded-t-xl border-b-4 border-[#FFD700]">
          <div className="flex items-center space-x-4 space-x-reverse mb-4 md:mb-0">
            <div className="text-6xl p-3 rounded-full bg-[#0d284e] border-4 border-[#FFD700] leading-none w-20 h-20 flex items-center justify-center shadow-lg">
              <span role="img" aria-label="Teacher Symbol">{profile.character}</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">{profile.name}</h1>
              <p className="text-md text-gray-300">{profile.subject}</p>
            </div>
          </div>
          <div className="text-center md:text-left">
            <div className="mb-2 text-white font-bold text-lg">
                {profile.pricePerHour} ج.م / ساعة
            </div>
            <span className="inline-block px-4 py-1 text-sm font-semibold rounded-full bg-green-500 text-white shadow-md">
              الحالة: {profile.status}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-8">
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-extrabold text-[#0d284e] mb-4 border-b pb-2 flex justify-between items-center">
                    الملف الشخصي والسعر 🏷️
                    <button 
                        onClick={() => {
                            setIsEditingProfile(true); 
                            setEditData({ description: profile.description, pricePerHour: profile.pricePerHour });
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                    >
                        <i className="fas fa-edit ml-1"></i> تعديل
                    </button>
                </h2>
                
                {!isEditingProfile ? (
                    <div className="space-y-3">
                        <p className="text-gray-700 text-sm italic">{profile.description}</p>
                        <p className="text-lg font-bold text-green-700 border-t pt-2">السعر: {profile.pricePerHour} ج.م / ساعة</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <textarea
                            value={editData.description}
                            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-2 border rounded-lg focus:ring-[#FFD700] focus:border-[#FFD700] transition-colors h-32"
                            placeholder="وصفك الشخصي كمعلم..."
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ج.م / ساعة)</label>
                            <input
                                type="number"
                                value={editData.pricePerHour}
                                onChange={(e) => setEditData(prev => ({ ...prev, pricePerHour: parseInt(e.target.value) || 0 }))}
                                className="w-full p-2 border rounded-lg focus:ring-[#FFD700] focus:border-[#FFD700] transition-colors"
                                min="1"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 space-x-reverse">
                            <button
                                onClick={() => setIsEditingProfile(false)}
                                className="px-4 py-2 text-sm bg-gray-300 rounded-lg hover:bg-gray-400"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={saveProfile}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                حفظ التغييرات
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-extrabold text-[#0d284e] mb-4 border-b pb-2">إدارة المواعيد المتاحة 📅</h2>

                {feedback.message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm font-semibold ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {feedback.message}
                    </div>
                )}
                
                <div className="space-y-3 mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <h3 className="text-lg font-bold text-[#17365e]">إضافة وقت جديد</h3>
                    <input
                        type="date"
                        value={newSlot.date}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full p-2 border rounded-lg focus:ring-[#FFD700] focus:border-[#FFD700] transition-colors"
                    />
                    <input
                        type="time"
                        value={newSlot.time}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full p-2 border rounded-lg focus:ring-[#FFD700] focus:border-[#FFD700] transition-colors"
                    />
                    <button
                        onClick={addSlot}
                        className="w-full py-2 bg-[#d6b876] text-[#0d284e] font-bold rounded-lg shadow-md hover:bg-[#FFD700] transition-colors"
                    >
                        <i className="fas fa-plus ml-2"></i> إضافة موعد
                    </button>
                </div>

                <h3 className="text-lg font-bold text-[#0d284e] mb-3">المواعيد المتاحة حالياً:</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.keys(groupedAvailability).length > 0 ? (
                        Object.keys(groupedAvailability).sort().map(dateKey => (
                            <div key={dateKey}>
                                <p className="text-md font-bold text-[#17365e] sticky top-0 bg-gray-100 py-1">{formatDate(dateKey)}</p>
                                <div className="space-y-2">
                                    {groupedAvailability[dateKey].map(slot => (
                                        <AvailabilityCard key={slot.id} slot={slot} />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm p-3 border rounded-lg text-center">لا توجد أوقات إتاحة مضافة.</p>
                    )}
                </div>
            </div>

          </div>

          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-extrabold text-[#0d284e] mb-4 border-b pb-2">تقييمات الأداء 🌟</h2>
                <div className="flex justify-between items-center bg-yellow-50 p-4 rounded-lg shadow-inner mb-4">
                    <p className="text-xl font-bold text-yellow-800">متوسط التقييم:</p>
                    <div className="text-3xl font-extrabold text-yellow-600 flex items-center">
                        {profile.averageRating}
                        <i className="fas fa-star ml-2"></i>
                        <span className="text-sm text-gray-500 mr-2">({profile.totalReviews} تقييم)</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-[#17365e] mb-3">التعليقات الأخيرة:</h3>
                <div className="space-y-3 max-h-52 overflow-y-auto">
                    {reviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
                {reviews.length === 0 && <p className="text-gray-500 text-sm text-center">لا توجد تقييمات حتى الآن.</p>}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-extrabold text-[#0d284e] mb-4 border-b pb-2">جدول الدروس القادمة 🔔</h2>

                <div className="space-y-6">
                {Object.keys(groupedLessons).length > 0 ? (
                    Object.keys(groupedLessons).sort().map(dateKey => (
                    <div key={dateKey} className="bg-gray-50 p-4 rounded-lg shadow-inner">
                        <h3 className="text-xl font-extrabold text-[#17365e] mb-3 border-b pb-2">
                        {formatDate(dateKey)}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groupedLessons[dateKey].map(lesson => (
                            <LessonCard key={lesson.id} lesson={lesson} />
                        ))}
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="bg-blue-100 p-6 rounded-lg text-center">
                    <p className="text-lg text-blue-700 font-bold">🎉 تهانينا! جدولك خالٍ من الدروس حالياً. أضف أوقات إتاحة جديدة!</p>
                    </div>
                )}
                </div>

                <div className="mt-8 pt-4 border-t text-center">
                    <button 
                        onClick={() => setFeedback({ message: 'تم فتح رابط الدرس الافتراضي. (وظيفة وهمية)', type: 'success' })}
                        className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-xl hover:bg-red-700 transition-colors transform hover:scale-105"
                    >
                        <i className="fas fa-video ml-2"></i> بدء الدرس الحالي (Mock)
                    </button>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
