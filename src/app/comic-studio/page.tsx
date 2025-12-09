'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  WandSparkles,
  CheckCircle,
  Loader,
  XCircle,
  Mic,
  StopCircle,
  Save,
} from 'lucide-react';
import { getComicDialog } from './actions';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

type StatusType = 'info' | 'loading' | 'success' | 'error';

const StatusDisplay = ({
  type,
  message,
}: {
  type: StatusType;
  message: string;
}) => {
  const ICONS: Record<StatusType, React.ReactNode> = {
    info: <CheckCircle className="w-4 h-4 text-gray-500" />,
    loading: <Loader className="w-4 h-4 text-blue-500 animate-spin" />,
    success: <CheckCircle className="w-4 h-4 text-green-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
  };

  const TEXT_COLORS: Record<StatusType, string> = {
    info: 'text-gray-500',
    loading: 'text-blue-500',
    success: 'text-green-500',
    error: 'text-red-500',
  };

  return (
    <div className={`flex items-center space-x-2 ${TEXT_COLORS[type]}`}>
      {ICONS[type]}
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default function ComicStudioPage() {
  const [scene, setScene] = useState('family');
  const [dialogue, setDialogue] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: StatusType; message: string }>({
    type: 'info',
    message: 'جاهز للعمل.',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const appId = 'yalla-masry-academy'; // This would typically come from env variables

  useEffect(() => {
    // Cleanup audio URL on unmount
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleGenerateDialog = async () => {
    setIsGenerating(true);
    setStatus({ type: 'loading', message: 'جاري توليد الحوار...' });
    setDialogue([]);

    const result = await getComicDialog({ scene });

    if (result.success && result.success.length === 3) {
      setDialogue(result.success);
      setStatus({ type: 'success', message: 'تم! يمكنك الآن بدء التسجيل.' });
      toast({
        title: 'تم توليد الحوار بنجاح!',
        description: 'حان دورك الآن لتؤدي المشهد بصوتك.',
      });
    } else {
      setStatus({ type: 'error', message: 'فشل التوليد. حاول مجدداً.' });
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description:
          result.error || 'لم نتمكن من توليد الحوار. يرجى المحاولة مرة أخرى.',
      });
    }
    setIsGenerating(false);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: 'destructive',
        title: 'المتصفح غير مدعوم',
        description: 'خاصية تسجيل الصوت غير مدعومة في هذا المتصفح.',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const newAudioBlob = new Blob(audioChunks, { type: 'audio/webm; codecs=opus' });
        setAudioBlob(newAudioBlob);
        const newAudioUrl = URL.createObjectURL(newAudioBlob);
        setAudioUrl(newAudioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setAudioBlob(null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setStatus({ type: 'loading', message: 'جاري التسجيل...' });
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        variant: 'destructive',
        title: 'فشل الوصول للميكروفون',
        description: 'يرجى التأكد من إعطاء الإذن لاستخدام الميكروفون.',
      });
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus({
        type: 'info',
        message: 'تم الإيقاف. استمع للتسجيل أو احفظه.',
      });
    }
  };

  const handleSubmitAudio = async () => {
    if (!user) {
       toast({ variant: 'destructive', title: 'خطأ', description: 'يجب تسجيل الدخول لحفظ الأداء.' });
       return;
    }
     if (!audioBlob) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'لا يوجد تسجيل لحفظه.' });
       return;
    }
     if (!firestore) {
       toast({ variant: 'destructive', title: 'خطأ', description: 'خدمة قاعدة البيانات غير متاحة.' });
       return;
    }

    setStatus({ type: 'loading', message: 'جاري حفظ الأداء...' });

    // Note: In a real-world app, you'd upload the audioBlob to Firebase Storage
    // and then save the URL in Firestore. For this prototype, we'll just save the metadata.
    const performanceCollectionPath = `/artifacts/${appId}/users/${user.uid}/comic_performances`;
    const performanceData = {
      scene: scene,
      generatedDialog: dialogue,
      recordingDate: new Date().toISOString(),
      audioMimeType: audioBlob.type,
      status: 'Pending Review',
    };
    
    addDocumentNonBlocking(collection(firestore, performanceCollectionPath), performanceData);

    toast({
        title: 'تم حفظ الأداء بنجاح!',
        description: 'سيتم تقييمه قريبًا من قبل معلمك.',
    });
    setStatus({ type: 'success', message: 'تم حفظ الأداء بنجاح!' });
    setAudioBlob(null);
    if(audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };


  return (
    <div className="min-h-screen bg-[#e0f2f1] p-4 sm:p-6 lg:p-8">
      <header className="bg-[#00796b] shadow-xl text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-extrabold tracking-tight">استوديو القصص المصورة</h1>
            <Link href="/" className="text-sm font-semibold hover:text-gray-200 transition">
                 العودة للوحة التحكم
            </Link>
        </div>
      </header>
       <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">اصنع قصتك وكن نجم الدبلجة!</h2>
            <p className="text-lg text-gray-600 mb-10">اختر مشهداً، ثم اطلب من الذكاء الاصطناعي توليد حوار بالعامية، وسجل صوتك لتؤدي الدور!</p>

             <Card className="p-6 mb-10 border-t-4 border-[#ffb300]">
                 <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-3 space-x-reverse w-full md:w-auto">
                        <label htmlFor="scene-select" className="font-semibold text-gray-700 whitespace-nowrap">اختر مشهد:</label>
                        <Select onValueChange={setScene} defaultValue={scene}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="اختر مشهدًا" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="market">1. السوق الشعبي</SelectItem>
                                <SelectItem value="school">2. فناء المدرسة</SelectItem>
                                <SelectItem value="family">3. العشاء العائلي</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleGenerateDialog} disabled={isGenerating} className="bg-[#ffb300] text-gray-800 font-bold hover:bg-[#ffc107] shadow-md">
                        <WandSparkles className="ml-2 h-4 w-4" />
                        {isGenerating ? 'جاري التوليد...' : 'توليد حوار العامية (Gemini)'}
                    </Button>
                    
                    <StatusDisplay type={status.type} message={status.message} />
                 </div>
            </Card>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {[1, 2, 3].map((panelNum) => (
                    <div key={panelNum} className="bg-white border-4 border-black rounded-lg p-4 relative aspect-square flex flex-col justify-between shadow-[8px_8px_0px_rgba(0,0,0,0.6)]">
                         <div className="absolute top-2 right-2 bg-black text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg">{panelNum}</div>
                         <div className="flex-grow flex items-center justify-center">
                            <Image src={`https://picsum.photos/seed/${scene}${panelNum}/400/400`} alt={`Scene panel ${panelNum}`} width={200} height={200} className="rounded-lg object-cover" />
                        </div>
                         <div className="bg-white border-2 border-black rounded-xl p-3 shadow-md">
                            <p className="text-center font-semibold">
                                {dialogue[panelNum - 1] || `...`}
                            </p>
                        </div>
                    </div>
                ))}
            </section>
            
            <Card className="mt-8 p-6 bg-blue-50 shadow-inner">
                 <h3 className="text-xl font-bold text-gray-700 mb-4">تدريب النطق (أداء الأدوار)</h3>
                <div className="flex items-center justify-between space-x-4 space-x-reverse">
                    <p className="text-sm text-gray-500">سجل صوتك وأنت تقرأ الحوار بالترتيب. سيتم حفظ التسجيل.</p>
                     <div className="flex space-x-4 space-x-reverse">
                        <Button onClick={startRecording} disabled={isRecording || dialogue.length === 0} variant="destructive">
                            <Mic className="ml-2 h-4 w-4" /> تسجيل
                        </Button>
                         <Button onClick={stopRecording} disabled={!isRecording} variant="secondary">
                            <StopCircle className="ml-2 h-4 w-4" /> إيقاف
                        </Button>
                         <Button onClick={handleSubmitAudio} disabled={!audioBlob} className="bg-green-600 hover:bg-green-700">
                             <Save className="ml-2 h-4 w-4" /> حفظ الأداء
                        </Button>
                    </div>
                </div>
                 {isRecording && <div className="mt-3 text-sm text-red-600 font-medium animate-pulse">جاري التسجيل...</div>}
                {audioUrl && (
                    <div className="mt-4">
                        <audio src={audioUrl} controls className="w-full" />
                    </div>
                )}
            </Card>

        </div>
    </main>
    </div>
  );
}
