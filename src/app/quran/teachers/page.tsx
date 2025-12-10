'use client';

import React from 'react';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { ArrowRight, GraduationCap, Loader2 } from 'lucide-react';

interface Instructor {
  id: string;
  teacherName: string;
  specialty?: string;
  photo?: string;
  status?: 'Active' | 'Inactive';
  lessonPrice?: number;
  isQuranTeacher?: boolean; // Hypothetical field to filter Quran teachers
}

const TeacherCard = ({ teacher }: { teacher: Instructor }) => (
  <div className="dashboard-card text-white p-6 rounded-2xl shadow-lg text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-gold-accent flex flex-col">
    <div className="relative w-32 h-32 mx-auto mb-4">
      <img src={teacher.photo || `https://picsum.photos/seed/${teacher.id}/200/200`} alt={`صورة ${teacher.teacherName}`} className="rounded-full w-full h-full object-cover border-4 border-gold-accent" />
      <span 
        className={`absolute bottom-1 right-1 block h-5 w-5 rounded-full border-2 border-nile-dark ${teacher.status === 'Active' ? 'bg-green-400' : 'bg-gray-500'}`}
        title={teacher.status === 'Active' ? 'متاح' : 'غير متاح'}
      ></span>
    </div>
    <h3 className="text-xl font-bold royal-title mb-1">{teacher.teacherName}</h3>
    <p className="text-sm text-sand-ochre mb-3 flex-grow">{teacher.specialty || 'معلم قرآن كريم'}</p>
    {teacher.lessonPrice && (
      <div className="text-lg font-bold text-white mb-4 bg-nile-dark/30 py-1 px-3 rounded-full self-center">${teacher.lessonPrice} / ساعة</div>
    )}
    <button
      disabled={teacher.status !== 'Active'}
      className="w-full mt-auto cta-button"
    >
      {teacher.status === 'Active' ? 'احجز الآن' : 'غير متاح'}
    </button>
  </div>
);

export default function TeachersPage() {
  const firestore = useFirestore();
  
  // In a real app, you might have a dedicated field like `isQuranTeacher: true`
  // For now, we fetch all instructors and could filter on the client, or assume all are Quran teachers for this page.
  const instructorsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    // This query would ideally filter for Quran teachers, e.g., where('tags', 'array-contains', 'quran')
    return collection(firestore, 'instructors'); 
  }, [firestore]);

  const { data: teachers, isLoading, error } = useCollection<Instructor>(instructorsCollection);

  return (
    <div 
      className="min-h-screen p-4 md:p-8 flex flex-col bg-nile-dark"
      style={{
        direction: 'rtl',
      }}
    >
      <header className="text-center my-12">
        <div className="inline-block p-4 bg-nile rounded-full shadow-lg mb-4 border-2 border-gold-accent">
            <GraduationCap className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 royal-title">
          نخبة معلمي القرآن
        </h1>
        <p className="text-xl text-sand-ochre">
          اختر من بين أفضل المعلمين والمعلمات لبدء رحلتك مع القرآن.
        </p>
      </header>

      <main className="w-full max-w-6xl mx-auto flex-grow">
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
            <p className="text-center text-lg text-sand-ochre ml-4">جاري تحميل قائمة المعلمين...</p>
          </div>
        )}
        {error && <p className="text-center text-lg text-red-400">حدث خطأ أثناء تحميل المعلمين: {error.message}</p>}
        
        {teachers && (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachers.map(teacher => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        )}

        {!isLoading && teachers?.length === 0 && (
            <p className="text-center text-sand-ochre py-10">لا يوجد معلمون مسجلون حالياً.</p>
        )}
      </main>

      <footer className="mt-auto pt-12 text-center text-gray-400 text-sm">
         <Link href="/quran" className="utility-button px-6 py-2 text-md font-bold rounded-lg flex items-center justify-center mx-auto w-fit">
            <ArrowRight className="ml-2 h-4 w-4" />
            <span>العودة إلى واحة القرآن</span>
        </Link>
        <p className="mt-4">جميع الحقوق محفوظة لأكاديمية يلا مصري © 2024</p>
      </footer>
    </div>
  );
}
