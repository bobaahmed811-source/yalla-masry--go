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

export default function SignupPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    initiateEmailSignUp(auth, email, password, (user) => {
        if (user) {
            updateProfileNonBlocking(user, { displayName: name });
            toast({
                title: "تم إنشاء الحساب بنجاح!",
                description: "سيتم توجيهك الآن لتحديد أهدافك."
            });
            router.push('/goals');
        }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-nile-dark p-4">
      <Card className="w-full max-w-sm mx-auto dashboard-card text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <i className="fas fa-scroll text-4xl text-gold-accent"></i>
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
                />
              </div>
              <Button type="submit" className="w-full cta-button">
                إنشاء حساب ملكي
              </Button>
              <Button variant="outline" className="w-full utility-button" disabled>
                التسجيل بواسطة Google
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
