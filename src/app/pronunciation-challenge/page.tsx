'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Mic,
  StopCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  ArrowLeft,
  Loader2,
  WandSparkles,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { getSpeechAudio, getPronunciationAnalysis } from '../ai-actions';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, increment } from 'firebase/firestore';

// Define the type for a phrase from Firestore
interface Phrase {
  id: string;
  category: string;
  text: string;
  translation: string;
}

type AnalysisResult = {
    evaluation: 'correct' | 'incorrect' | 'unclear';
    feedback: string;
} | null;

const lang: Record<string, Record<string, string>> = {
  ar: {
    title: "تحديات قوة حتشبسوت الفرعونية",
    slogan: "هو واقع المتعة فى التعلم",
    mentor: "استمعي للمرسوم الملكي، ثم أعلني ولاءك بترديده",
    loading_phrases: "جاري تحميل المراسيم الملكية...",
    record: 'سجل صوتك',
    recording: 'جاري التسجيل...',
    stop_recording: 'إيقاف التسجيل',
    next: 'التحدي التالي',
    go_back: 'العودة للوحة التحكم',
    play_audio: 'استمع للمرسوم',
    evaluate: 'استدعِ أذن فرعون للتقييم',
    evaluating: 'أذن فرعون تستمع...',
    mic_error_title: 'خطأ في الميكروفون',
    mic_error_desc: 'يرجى التأكد من إعطاء الإذن لاستخدام الميكروفون.',
    mic_unsupported_title: 'المتصفح غير مدعوم',
    mic_unsupported_desc: 'خاصية تسجيل الصوت غير مدعومة في هذا المتصفح.',
    analysis_error: 'فشل تحليل النطق.',
    your_recording: 'تسجيلك:',
    evaluation_title: 'تقييم أذن فرعون',
  },
  en: {
    title: "Hatshepsut's Pharaoh's Might Challenges",
    slogan: "The Reality of Fun in Learning",
    mentor: "Listen to the royal decree, then declare your loyalty by repeating it.",
    loading_phrases: 'Loading Royal Decrees...',
    record: 'Record Voice',
    recording: 'Recording...',
    stop_recording: 'Stop Recording',
    next: 'Next Challenge',
    go_back: 'Back to Dashboard',
    play_audio: 'Listen to Decree',
    evaluate: "Invoke Pharaoh's Ear for Evaluation",
    evaluating: "Pharaoh's Ear is listening...",
    mic_error_title: 'Microphone Error',
    mic_error_desc: 'Please ensure you have given permission to use the microphone.',
    mic_unsupported_title: 'Browser Not Supported',
    mic_unsupported_desc: 'Audio recording is not supported in this browser.',
    analysis_error: 'Pronunciation analysis failed.',
    your_recording: 'Your Recording:',
    evaluation_title: "Pharaoh's Ear Evaluation",
  },
};


export default function PronunciationChallengePage() {
  const [currentLang, setCurrentLang] = useState('ar');
  const [isRecording, setIsRecording] = useState(false);
  const [userAudioBlob, setUserAudioBlob] = useState<Blob | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [isLoadingMentorAudio, setIsLoadingMentorAudio] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);

  const { user, firestore } = useUser(true);
  const [nilePoints, setNilePoints] = useState(0);

  const phrasesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'phrases') : null, [firestore]);
  const { data: phrases, isLoading: isLoadingPhrases } = useCollection<Phrase>(phrasesCollection);

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  const { toast } = useToast();
  
  const challengePhrase = phrases ? phrases[currentPhraseIndex]?.text : '...';
  const texts = lang[currentLang] || lang.ar;
  const isRtl = currentLang === 'ar';
  
  useEffect(() => {
    if (user && typeof user.nilePoints === 'number') {
      setNilePoints(user.nilePoints);
    }
  }, [user]);
  
  useEffect(() => {
    return () => {
      if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
    };
  }, [userAudioUrl]);

  const handlePlayMentorAudio = async () => {
    if (!challengePhrase || challengePhrase === '...') return;
    setIsLoadingMentorAudio(true);
    toast({ title: "جاري توليد صوت المرشد..." });
    try {
      const result = await getSpeechAudio(challengePhrase);
      if (result.error || !result.media) {
        throw new Error(result.error || 'No media returned');
      }
      const audio = new Audio(result.media);
      audio.play();
    } catch (error) {
      console.error("Error playing mentor audio:", error);
      toast({ variant: 'destructive', title: "خطأ في تشغيل الصوت", description: (error as Error).message });
    } finally {
      setIsLoadingMentorAudio(false);
    }
  };
  
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({ variant: 'destructive', title: texts.mic_unsupported_title, description: texts.mic_unsupported_desc });
      return;
    }
    setAnalysisResult(null);
    if(userAudioUrl) URL.revokeObjectURL(userAudioUrl);
    setUserAudioUrl(null);
    setUserAudioBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => audioChunks.push(event.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setUserAudioBlob(audioBlob);
        const newAudioUrl = URL.createObjectURL(audioBlob);
        setUserAudioUrl(newAudioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({ variant: 'destructive', title: texts.mic_error_title, description: texts.mic_error_desc });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyzePronunciation = async () => {
    if (!userAudioBlob || !user || !firestore) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'لا يوجد تسجيل لتحليله أو أنك غير مسجل الدخول.' });
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(userAudioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const result = await getPronunciationAnalysis({
          userAudio: base64Audio,
          originalText: challengePhrase
        });

        if (result.success && result.analysis) {
            setAnalysisResult(result.analysis);
            if (result.analysis.evaluation === 'correct') {
                const pointsToAward = 25;
                const userRef = doc(firestore, 'users', user.uid);
                await updateDoc(userRef, { nilePoints: increment(pointsToAward) });
                setNilePoints(prev => prev + pointsToAward);
                toast({ title: `رائع! +${pointsToAward} نقطة نيل`, description: 'نطقك سليم!' });
            }
        } else {
            throw new Error(result.error || texts.analysis_error);
        }
      };
    } catch (error) {
       console.error("Error analyzing pronunciation:", error);
       toast({ variant: 'destructive', title: 'خطأ في التحليل', description: (error as Error).message });
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleNextChallenge = () => {
    if (phrases) {
        setCurrentPhraseIndex(prev => (prev + 1) % phrases.length);
        if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
        setUserAudioUrl(null);
        setUserAudioBlob(null);
        setAnalysisResult(null);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
  };

  const getEvaluationIcon = () => {
    if (!analysisResult) return null;
    switch(analysisResult.evaluation) {
        case 'correct': return <CheckCircle className="w-8 h-8 text-green-400" />;
        case 'incorrect': return <XCircle className="w-8 h-8 text-red-400" />;
        case 'unclear': return <AlertCircle className="w-8 h-8 text-yellow-400" />;
    }
  };

   return (
      <div className={cn("relative flex items-center justify-center min-h-screen bg-nile-dark p-4 overflow-hidden", isRtl ? "rtl" : "ltr")}>
        <div 
            className="absolute inset-0 bg-cover bg-center z-0 opacity-20"
            style={{backgroundImage: "url('https://picsum.photos/seed/hatshepsut-challenge/1200/800')"}}
            data-ai-hint="pharaoh temple"
        ></div>

       <div className={cn("fixed top-4 z-20 flex items-center gap-4", isRtl ? "right-4" : "left-4")}>
        <Select onValueChange={handleLanguageChange} defaultValue={currentLang}>
          <SelectTrigger className="w-[180px] bg-gold-accent text-dark-granite border-none royal-title font-bold shadow-lg">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English (EN)</SelectItem>
            <SelectItem value="ar">العربية (AR)</SelectItem>
          </SelectContent>
        </Select>
         <Link href="/" className="utility-button px-4 py-2 text-md font-bold rounded-lg flex items-center justify-center">
            <ArrowLeft className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
            <span>{texts.go_back}</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-3xl p-6 bg-nile-dark/80 backdrop-blur-sm rounded-2xl shadow-2xl dashboard-card text-white border-2 border-gold-accent">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-dark-granite mb-2">
            <span className="royal-title text-gold-accent">{texts.title}</span>
          </h1>
           <p className="text-xl font-bold text-sand-ochre">{texts.slogan}</p>
          <p className="text-lg text-sand-ochre mt-2">{texts.mentor}</p>
        </div>

        <div className="bg-nile p-8 md:p-12 rounded-xl shadow-inner border-2 border-sand-ochre/20">
          <div className="mb-8 p-4 bg-nile-dark rounded-lg border-2 border-dashed border-sand-ochre min-h-[96px] flex items-center justify-center">
            {isLoadingPhrases ? (
                <div className="flex items-center gap-2 text-sand-ochre">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>{texts.loading_phrases}</span>
                </div>
            ) : (
                <p className="text-4xl font-extrabold text-white" style={{fontFamily: "'El Messiri', sans-serif"}}>
                {challengePhrase}
                </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col items-center gap-2">
                <Button
                    onClick={handlePlayMentorAudio}
                    disabled={isLoadingMentorAudio || isLoadingPhrases}
                    className="shadow-lg w-24 h-24 rounded-full bg-gold-accent text-nile-dark text-3xl mx-auto flex items-center justify-center hover:bg-yellow-300 transition-all duration-300 disabled:bg-gray-500 disabled:opacity-50"
                >
                    {isLoadingMentorAudio ? <Loader2 className="animate-spin" /> : <Play />}
                </Button>
                <span className="text-sm font-bold text-sand-ochre">{texts.play_audio}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoadingPhrases}
                    className={cn("shadow-lg w-24 h-24 rounded-full text-white text-3xl mx-auto flex items-center justify-center transition-all duration-300 transform hover:scale-110", isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700')}
                >
                    {isRecording ? <StopCircle /> : <Mic />}
                </Button>
                 <span className="text-sm font-bold text-sand-ochre">{isRecording ? texts.recording : texts.record}</span>
            </div>
          </div>
          
          {userAudioUrl && (
            <div className="mt-6 bg-nile-dark/50 p-4 rounded-lg">
                <h3 className="text-sand-ochre font-bold mb-2">{texts.your_recording}</h3>
                <audio src={userAudioUrl} controls className="w-full" />
                 <Button onClick={handleAnalyzePronunciation} disabled={isAnalyzing || isLoadingPhrases} className="w-full mt-4 cta-button bg-teal-600 hover:bg-teal-700">
                    {isAnalyzing ? <Loader2 className="animate-spin ml-2" /> : <WandSparkles className="ml-2"/>}
                    {isAnalyzing ? texts.evaluating : texts.evaluate}
                 </Button>
            </div>
           )}

            {analysisResult && (
                <div className="mt-6 p-4 rounded-lg bg-nile-dark/70 border border-sand-ochre/50">
                    <div className="flex items-center gap-3">
                        {getEvaluationIcon()}
                        <h4 className="text-xl font-bold royal-title text-gold-accent">{texts.evaluation_title}</h4>
                    </div>
                    <p className={cn("mt-2 text-lg text-sand-ochre", isRtl ? "mr-11" : "ml-11")}>{analysisResult.feedback}</p>
                </div>
            )}


          <div className={cn("mt-10 flex", isRtl ? "justify-start" : "justify-end")}>
            <Button
              disabled={!phrases || phrases.length === 0}
              className="cta-button px-6 py-3 text-lg rounded-full flex items-center"
              onClick={handleNextChallenge}
            >
              {!isRtl && <span>{texts.next}</span>}
              {isRtl ? <ChevronLeft className="mr-2" /> : <ChevronRight className="ml-2" />}
              {isRtl && <span>{texts.next}</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
