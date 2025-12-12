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
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { FirebaseError } from 'firebase/app';

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


export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({ variant: "destructive", title: "خطأ", description: "خدمة المصادقة غير متاحة."});
        return;
    }
    setIsSubmitting(true);
    initiateEmailSignIn(auth, email, password, (result) => {
        if(result.success && result.user) {
            toast({
                title: `مرحباً بعودتك!`,
                description: "تم تسجيل دخولك بنجاح."
            });
            // The useUser hook's onAuthStateChanged listener in the provider
            // will handle fetching the full user profile and redirecting.
            // We just push to the root page.
            router.push('/');
        } else if (result.error) {
            let description = "البريد الإلكتروني أو كلمة السر غير صحيحة. يرجى المحاولة مرة أخرى.";
            switch(result.error.code) {
                case 'auth/user-not-found':
                case 'auth/invalid-credential':
                    description = "هذا الحساب غير مسجل. هل تودين إنشاء حساب جديد؟";
                    break;
                case 'auth/wrong-password':
                    description = "كلمة السر غير صحيحة. يرجى المحاولة مرة أخرى.";
                    break;
                 case 'auth/invalid-email':
                    description = "صيغة البريد الإلكتروني غير صحيحة.";
                    break;
            }
            toast({
                variant: "destructive",
                title: "فشل تسجيل الدخول",
                description: description
            });
        }
        setIsSubmitting(false);
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-nile-dark p-4">
      <Card className="w-full max-w-sm mx-auto dashboard-card text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
             <Logo />
          </div>
          <CardTitle className="text-3xl royal-title">بوابة العودة الملكية</CardTitle>
          <CardDescription className="text-sand-ochre">أدخل أوراق اعتمادك للعودة إلى مملكتك</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
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
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-sand-ochre">كلمة السر</Label>
                  <Link
                    href="#"
                    className="mr-auto inline-block text-sm text-sand-ochre underline"
                  >
                    نسيت كلمة السر؟
                  </Link>
                </div>
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
                {isSubmitting ? 'جاري الدخول...' : 'تسجيل الدخول'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm text-sand-ochre">
            لا تملك حساباً؟{' '}
            <Link href="/signup" className="underline font-bold">
              انضم إلى المملكة
            </Link>
          </div>
           <div className="mt-2 text-center text-xs text-gray-400">
            مستخدم جديد؟ سيتم توجيهك لاختيار هدفك بعد الإنضمام.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
