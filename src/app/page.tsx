'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { ArrowRight, BookOpen, Crown, Gem, LogIn, UserPlus, LogOut } from 'lucide-react';
import { initiateSignOut } from '@/firebase/non-blocking-login';
import { useAuth } from '@/firebase';

const StatCard = ({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) => (
    <Card className="stat-card p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-sand-ochre">{label}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-white">{value}</div>
        </CardContent>
    </Card>
);

const ChallengeLink = ({ href, title, description, icon }: { href: string; title: string; description: string; icon: React.ReactNode; }) => (
    <Link href={href} className="challenge-item group block p-4 rounded-lg transition-all duration-300">
        <div className="flex items-center gap-4">
            <div className="icon-symbol text-3xl">{icon}</div>
            <div>
                <h3 className="font-bold text-white group-hover:text-gold-accent transition-colors">{title}</h3>
                <p className="text-sm text-sand-ochre">{description}</p>
            </div>
            <ArrowRight className="mr-auto h-5 w-5 text-sand-ochre group-hover:translate-x-1 transition-transform" />
        </div>
    </Link>
);


export default function HomePage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    
    // Default alias if user is not loaded or doesn't have one
    const alias = user?.displayName || 'الزائر الملكي';
    const nilePoints = 1250; // Mock data
    
    const handleSignOut = () => {
      if (auth) {
        initiateSignOut(auth);
      }
    };

    return (
        <div className="min-h-screen bg-nile-dark text-white p-4 md:p-8" style={{ direction: 'rtl' }}>
            <div className="max-w-7xl mx-auto">
                {isUserLoading ? (
                     <div className="text-center p-10">
                        <p className="text-xl text-sand-ochre">جاري استدعاء السجلات الملكية...</p>
                    </div>
                ) : user ? (
                    // Authenticated User Dashboard
                    <>
                        <header className="mb-10 flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black royal-title mb-2">
                                    مرحباً بعودتكِ يا <span className="text-white">{alias}</span>!
                                </h1>
                                <p className="text-xl text-sand-ochre">لوحة التحكم الملكية الخاصة بكِ في أكاديمية يلا مصري.</p>
                            </div>
                            <Button onClick={handleSignOut} variant="outline" className="utility-button">
                                <LogOut className="ml-2 h-4 w-4"/>
                                تسجيل الخروج
                            </Button>
                        </header>

                        <main>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                <StatCard icon={<Gem className="h-6 w-6 text-sand-ochre"/>} value={`${nilePoints}`} label="نقاط النيل" />
                                <StatCard icon={<BookOpen className="h-6 w-6 text-sand-ochre"/>} value="3" label="الدروس المكتملة" />
                                <StatCard icon={<Crown className="h-6 w-6 text-sand-ochre"/>} value="تلميذ النيل" label="المستوى الحالي" />
                            </div>

                            {/* Main Content Sections */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                
                                <Card className="dashboard-card">
                                    <CardHeader>
                                        <CardTitle className="royal-title text-2xl">تحديات المملكة</CardTitle>
                                        <CardDescription className="text-sand-ochre">صقلي مهاراتكِ واجمعي نقاط النيل.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ChallengeLink href="/pronunciation-challenge" title="قوة حتشبسوت" description="تحدي النطق والتكرار." icon={<i className="fas fa-microphone-alt"></i>} />
                                        <ChallengeLink href="/word-scramble" title="ألغاز الكلمات" description="أعيدي ترتيب الكلمات لتكوين جمل صحيحة." icon={<i className="fas fa-random"></i>} />
                                        <ChallengeLink href="/dialogue-challenge" title="حوارات السوق" description="تحدي محاكاة المواقف اليومية." icon={<i className="fas fa-comments"></i>} />
                                        <ChallengeLink href="/comic-studio" title="استوديو القصص" description="اصنعي قصصاً مصورة بصوتك." icon={<i className="fas fa-paint-brush"></i>} />
                                    </CardContent>
                                </Card>

                                <Card className="dashboard-card">
                                    <CardHeader>
                                        <CardTitle className="royal-title text-2xl">أدوات التعلم</CardTitle>
                                        <CardDescription className="text-sand-ochre">استكشفي موارد الأكاديمية.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ChallengeLink href="/learning-path" title="مسار التعلم الملكي" description="تابعي تقدمكِ في المنهج الدراسي." icon={<i className="fas fa-map-signs"></i>} />
                                        <ChallengeLink href="/tutor" title="المعلم الخصوصي الذكي" description="احصلي على إجابات فورية لأسئلتك." icon={<i className="fas fa-user-graduate"></i>} />
                                        <ChallengeLink href="/audio-library" title="خزانة الأصوات" description="استمعي للنطق الصحيح للعبارات." icon={<i className="fas fa-volume-up"></i>} />
                                        <ChallengeLink href="/instructors" title="معلمات المملكة" description="تصفحي ملفات المعلمات المعتمدات." icon={<i className="fas fa-chalkboard-teacher"></i>} />
                                        <ChallengeLink href="/booking" title="حجز الدروس" description="احجزي درسكِ الخاص القادم." icon={<i className="fas fa-calendar-check"></i>} />
                                    </CardContent>
                                </Card>
                            </div>
                        </main>
                    </>
                ) : (
                    // Unauthenticated User Landing
                    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
                        <Crown className="w-24 h-24 text-gold-accent mb-4" />
                        <h1 className="text-5xl md:text-6xl font-black royal-title mb-4">
                          أهلاً بكِ في أكاديمية يلا مصري
                        </h1>
                        <p className="text-2xl text-sand-ochre mb-10 max-w-2xl">
                          البوابة الملكية للنساء والأطفال لإتقان اللهجة المصرية في بيئة آمنة وممتعة.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Link href="/login" legacyBehavior><Button className="cta-button text-lg px-8 py-6"><LogIn className="ml-2" /> تسجيل الدخول</Button></Link>
                          <Link href="/signup" legacyBehavior><Button className="utility-button text-lg px-8 py-6"><UserPlus className="ml-2"/> انضمي إلى المملكة</Button></Link>
                        </div>
                         <div className="mt-8">
                             <Link href="/landing" className="text-sand-ochre hover:text-gold-accent transition-colors underline">
                                أو تصفحي صفحة الهبوط الكاملة
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
