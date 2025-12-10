'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { initiateEmailSignUp, updateProfileNonBlocking } from '@/firebase/non-blocking-login';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const Logo = () => (
    <div className="flex items-center justify-center space-x-2 space-x-reverse">
        <svg
            className="w-12 h-12 text-gold-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
            <path d="M12 18a6 6 0 0 0-6-6h12a6 6 0 0 0-6 6z"></path>
            <path d="M12 2v4"></path>
            <path d="M12 12v6"></path>
            <path d="M4.93 4.93l2.83 2.83"></path>
            <path d="M16.24 16.24l2.83 2.83"></path>
            <path d="M2 12h4"></path>
            <path d="M18 12h4"></path>
            <path d="M4.93 19.07l2.83-2.83"></path>
            <path d="M16.24 7.76l2.83-2.83"></path>
        </svg>
    </div>
);

export default function SignupPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({
            variant: "destructive",
            title: "خطأ في التهيئة",
            description: "خدمة المصادقة غير متاحة. يرجى المحاولة لاحقًا.",
        });
        return;
    }
    setIsSubmitting(true);

    initiateEmailSignUp(auth, email, password, (result) => {
        if (result.success && result.user) {
            const user = result.user;
            // This is the crucial step: update the profile *after* user creation.
            updateProfileNonBlocking(user, { displayName: name }, (profileResult) => {
                setIsSubmitting(false); // Stop loading indicator regardless of profile update result
                if(profileResult.success) {
                    toast({
                        title: "تم إنشاء الحساب بنجاح!",
                        description: `مرحباً بكِ يا ${name}! سيتم توجيهك الآن إلى الخطوة التالية.`
                    });
                    // Redirect to the onboarding flow
                    router.push('/goals');
                } else {
                     toast({
                        variant: "destructive",
                        title: "نجح إنشاء الحساب، ولكن فشل تحديث الاسم",
                        description: profileResult.error?.message || 'يرجى تحديث اسمك من صفحة الملف الشخصي لاحقًا.'
                    });
                    router.push('/'); // Redirect even if name update fails
                }
            });
        } else if (result.error) {
            setIsSubmitting(false);
            let description = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
            switch(result.error.code) {
                case 'auth/email-already-in-use':
                    description = "هذا البريد الإلكتروني مسجل بالفعل. هل تريدين تسجيل الدخول؟";
                    break;
                case 'auth/weak-password':
                    description = "كلمة السر ضعيفة جدًا. يجب أن تتكون من 6 أحرف على الأقل.";
                    break;
                case 'auth/invalid-email':
                    description = "صيغة البريد الإلكتروني غير صحيحة.";
                    break;
            }
            toast({
                variant: "destructive",
                title: "فشل إنشاء الحساب",
                description: description,
            });
        }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-nile-dark p-4">
      <Card className="w-full max-w-sm mx-auto dashboard-card text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-3xl royal-title">سجل هويتك الفرعونية</CardTitle>
          <CardDescription className="text-sand-ochre">انضم إلى نخبة المتعلمين في أكاديمية يلا مصري</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="grid gap-4">
               <div className="grid gap-2">
                <Label htmlFor="name" className="text-sand-ochre">الاسم الكامل</Label>
                <Input 
                  id="name" 
                  placeholder="مثال: حتشبسوت" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-nile-dark border-sand-ochre text-white placeholder:text-sand-ochre/50 focus:ring-gold-accent"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sand-ochre">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@yallamasry.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-nile-dark border-sand-ochre text-white placeholder:text-sand-ochre/50 focus:ring-gold-accent"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-sand-ochre">كلمة السر</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-nile-dark border-sand-ochre text-white focus:ring-gold-accent"
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full cta-button" disabled={isSubmitting}>
                {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء حساب ملكي'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm text-sand-ochre">
            هل تملك حساباً بالفعل؟{' '}
            <Link href="/login" className="underline font-bold">
              الدخول إلى المملكة
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
