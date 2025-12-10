'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  VolumeUp,
  Loader,
  Mic,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { getSpeechAudio } from './actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Dictionary for all UI texts
const lang: Record<string, Record<string, string>> = {
  ar: {
    title: 'تحدي النطق الملكي',
    mentor: 'تحدي تلميذ النيل - الجملة الافتتاحية',
    instructions: 'استمع إلى الجملة ورددها بصوت واضح.',
    loading: 'جارٍ تجهيز صوت المرشد...',
    error: 'حدث خطأ: لا يمكن تشغيل الصوت.',
    record: 'سجل صوتك',
    next: 'التالي',
    go_back: 'العودة للوحة التحكم',
  },
  en: {
    title: 'The Royal Pronunciation Challenge',
    mentor: 'Disciple of the Nile Challenge - Opening Phrase',
    instructions: 'Listen to the sentence and repeat it clearly.',
    loading: "Preparing mentor's voice...",
    error: 'An error occurred: Cannot play audio.',
    record: 'Record Your Voice',
    next: 'Next',
    go_back: 'Back to Dashboard',
  },
  // Add other languages as needed
};

export default function PronunciationChallengePage() {
  const [currentLang, setCurrentLang] = useState('ar');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);

  const { toast } = useToast();
  const challengePhrase = 'صباح الخير، أنا كويس، متشكر.';
  const texts = lang[currentLang] || lang.ar;
  const isRtl = currentLang === 'ar';

  const fetchAudio = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    const result = await getSpeechAudio({ text: challengePhrase });

    if (result.success) {
      setAudioUrl(result.success);
      toast({
        title: '✅ الصوت جاهز',
        description: 'يمكنك الآن الاستماع إلى الجملة.',
      });
    } else {
      setError(result.error || texts.error);
      toast({
        variant: 'destructive',
        title: '❌ خطأ في الصوت',
        description: result.error || 'فشل في جلب المقطع الصوتي.',
      });
    }
    setIsLoading(false);
  }, [challengePhrase, texts.error, toast]);

  useEffect(() => {
    fetchAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch audio only on initial load

  const handlePlayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setIsPlaying(true);
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        setIsChallengeCompleted(true); // Enable next step after listening
        toast({
            title: ' دورك الآن!',
            description: 'يمكنك تسجيل صوتك للممارسة.',
        });
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setError(texts.error);
        toast({
          variant: 'destructive',
          title: '❌ خطأ في التشغيل',
          description: 'لم نتمكن من تشغيل الملف الصوتي.',
        });
      }
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    // UI texts will update automatically due to state change
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
       <div className="fixed top-4 right-4 z-10 flex items-center gap-4">
        <Select onValueChange={handleLanguageChange} defaultValue={currentLang}>
          <SelectTrigger className="w-[180px] bg-nile text-white border-none royal-title">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ar">العربية (AR)</SelectItem>
            <SelectItem value="en">English (EN)</SelectItem>
            <SelectItem value="fr">Français (FR)</SelectItem>
            <SelectItem value="es">Español (ES)</SelectItem>
          </SelectContent>
        </Select>
         <Link href="/" className="utility-button px-4 py-2 text-md font-bold rounded-lg flex items-center justify-center">
            <i className={`fas fa-arrow-left ${isRtl ? 'ml-2' : 'mr-2'}`}></i>
            <span>{texts.go_back}</span>
        </Link>
      </div>

      <div className="w-full max-w-xl p-6 bg-white rounded-2xl shadow-2xl border-t-8 border-gold-accent">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-dark-granite mb-2">
            <span className="royal-title text-nile">{texts.title}</span>
          </h1>
          <p className="text-lg text-gray-600">{texts.mentor}</p>
        </div>

        <div className="challenge-card bg-white p-10 rounded-xl shadow-inner border border-gray-100 text-center">
          <div className="mb-8 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-4xl font-extrabold text-nile royal-title">
              {challengePhrase}
            </p>
          </div>

          <p className="text-xl mb-8 text-dark-granite font-bold">
            {texts.instructions}
          </p>

          <Button
            id="play-button"
            onClick={handlePlayAudio}
            disabled={isLoading || !audioUrl || isPlaying}
            className="shadow-lg mb-8 w-20 h-20 rounded-full bg-nile text-white text-3xl mx-auto flex items-center justify-center hover:bg-nile-dark transition-all duration-300 disabled:bg-gray-400"
          >
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : isPlaying ? (
                <i className="fas fa-pause"></i>
            ) : (
              <VolumeUp size={30} />
            )}
          </Button>

          {error && (
            <p className="text-sm text-red-600 flex items-center justify-center gap-2">
              <AlertTriangle size={16} /> {error}
            </p>
          )}

          <div className={`mt-8 flex ${isRtl ? 'justify-between' : 'justify-between flex-row-reverse'}`}>
            <Button
              disabled={!isChallengeCompleted} // Enabled after listening
              className="cta-button px-6 py-3 text-lg rounded-full flex items-center"
            >
              <Mic className={isRtl ? 'ml-2' : 'mr-2'} />
              <span>{texts.record}</span>
            </Button>
            <Button
              disabled={!isChallengeCompleted} // Enabled after listening
              className="cta-button px-6 py-3 text-lg rounded-full flex items-center"
            >
              <span>{texts.next}</span>
              {isRtl ? <ChevronLeft className="mr-2" /> : <ChevronRight className="ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
