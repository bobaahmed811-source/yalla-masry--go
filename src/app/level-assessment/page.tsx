'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { BarChart3, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const assessmentData = {
  title: "ما هو مستواك الحالي في اللهجة المصرية؟",
  question: "اختر الجملة الأقرب لما يمكنك قوله بثقة:",
  options: [
    { value: "beginner", label: "مبتدئ", sentence: "صباح الخير، إزيك؟" },
    { value: "intermediate", label: "متوسط", sentence: "عايز واحد قهوة مظبوطة لو سمحت." },
    { value: "advanced", label: "متقدم", sentence: "يا جماعة، الموضوع ده محتاج قعدة عشان نفهم كل تفاصيله." },
  ],
};

export default function LevelAssessmentPage() {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user, firestore, isUserLoading } = useUser(true);

  const handleSubmit = async () => {
    if (!selectedValue) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يرجى اختيار مستوى لتقييم نفسك.',
      });
      return;
    }
    
    if (!user || !firestore) {
         toast({
            variant: 'destructive',
            title: 'خطأ',
            description: 'يجب تسجيل الدخول لحفظ المستوى. جاري إعادة التحميل...'
        });
        return;
    }

    setIsSubmitting(true);
    
    try {
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, {
            level: selectedValue
        });

        const levelLabel = assessmentData.options.find(o => o.value === selectedValue)?.label || "المحدد";
        const aiMessage = {
            beginner: `رائع! كل رحلة عظيمة تبدأ بخطوة. مسار التعلم الملكي هو أفضل بداية لك.`,
            intermediate: `ممتاز! أنت في منتصف الطريق. تحديات حوارات السوق ستصقل مهاراتك.`,
            advanced: `مستوى فرعوني متقدم! أنت جاهز للغوص في نقاشات أعمق في واحة القرآن والمتحف الافتراضي.`
        }[selectedValue] || `لقد تم تسجيل مستواك كـ "${levelLabel}". سنقوم بتخصيص التجربة لك!`;

        toast({
          title: 'تم تحديد مستواك!',
          description: aiMessage,
        });
        
        router.push('/');

    } catch (error) {
        console.error("Error updating level:", error);
        toast({
            variant: 'destructive',
            title: 'فشل حفظ المستوى',
            description: 'حدث خطأ أثناء حفظ مستواك. يرجى المحاولة مرة أخرى.'
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
    if (isUserLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-nile-dark p-4">
          <Loader2 className="h-12 w-12 text-gold-accent animate-spin" />
        </div>
      );
    }
  
    if (!user) {
    return (
       <div className="antialiased flex flex-col items-center justify-center min-h-screen bg-nile-dark p-4 text-center">
            <h1 className="text-3xl royal-title text-red-400 mb-4">الدخول محظور</h1>
            <p className="text-sand-ochre mb-6">يجب تسجيل الدخول للوصول إلى هذه القاعة.</p>
            <Link href="/login">
                <Button className="cta-button">العودة إلى بوابة الدخول</Button>
            </Link>
       </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-nile-dark p-4">
      <div className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-2xl dashboard-card text-white">
        <header className="text-center mb-10">
          <div className="inline-block p-3 bg-nile-dark/50 border-2 border-gold-accent rounded-full shadow-lg mb-4">
            <BarChart3 className="w-10 h-10 text-gold-accent" />
          </div>
          <h1 className="text-4xl font-extrabold royal-title text-gold-accent mb-2">
            قاعة اختبار المستوى
          </h1>
          <p className="text-lg text-sand-ochre">
            ساعدنا على فهم مستواك لنبني لك رحلة تعليمية مخصصة.
          </p>
        </header>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-center text-white">{assessmentData.question}</h2>
          
          <RadioGroup 
            onValueChange={setSelectedValue} 
            className="space-y-4"
            dir="rtl"
          >
            {assessmentData.options.map((option) => (
              <Label 
                key={option.value}
                htmlFor={option.value}
                className={cn(
                  "flex flex-col items-start p-6 border-2 rounded-lg cursor-pointer transition-all duration-300",
                  selectedValue === option.value 
                    ? 'border-gold-accent bg-sand-ochre/20' 
                    : 'border-sand-ochre/30 bg-nile/50 hover:bg-sand-ochre/10'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <RadioGroupItem value={option.value} id={option.value} className="h-6 w-6 text-gold-accent border-gold-accent" />
                    <span className="mr-4 text-xl font-bold text-white">{option.label}</span>
                  </div>
                  {selectedValue === option.value && <Check className="w-6 h-6 text-green-400" />}
                </div>
                <p className="mt-2 text-lg text-sand-ochre text-right w-full pr-10">"{option.sentence}"</p>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <footer className="mt-10 pt-6 border-t-2 border-sand-ochre/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="utility-button">
             العودة إلى لوحة التحكم
          </Link>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedValue || isSubmitting} 
            className="cta-button text-lg px-8"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : 'تأكيد المستوى والانطلاق'}
          </Button>
        </footer>
      </div>
    </div>
  );
}
