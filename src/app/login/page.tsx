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

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    initiateEmailSignIn(auth, email, password);
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-nile-dark p-4">
      <Card className="w-full max-w-sm mx-auto dashboard-card text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
             <i className="fas fa-ankh text-4xl text-gold-accent"></i>
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
                />
              </div>
              <Button type="submit" className="w-full cta-button">
                تسجيل الدخول
              </Button>
              <Button variant="outline" className="w-full utility-button" disabled>
                الدخول بواسطة Google
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm text-sand-ochre">
            لا تملك حساباً؟{' '}
            <Link href="/signup" className="underline font-bold">
              انضم إلى المملكة
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
