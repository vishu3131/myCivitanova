"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { slides } from '@/data/tutorialSlides';
import { useXPSystem } from '@/hooks/useXPSystem'; // Assuming this hook is available and works client-side
import Link from 'next/link';

interface TutorialSlidePageProps {
  params: {
    slideId: string;
  };
}

export default function TutorialSlidePage({ params }: TutorialSlidePageProps) {
  const router = useRouter();
  const { slideId } = params;
  const userId = "some_user_id"; // TODO: Replace with actual user ID from context/auth

  const { addXP } = useXPSystem(userId);

  const currentSlideIndex = slides.findIndex(slide => slide.id === slideId);
  const slide = slides[currentSlideIndex];

  useEffect(() => {
    if (!slide) {
      router.replace('/404'); // Or redirect to a default tutorial start page
    } else {
      // Award XP for viewing the slide
      if (userId && slide.xpReward) {
        addXP('tutorial_slide_viewed', slide.xpReward, {
          slide_id: slide.id,
          slide_index: currentSlideIndex,
          source: 'tutorial_page'
        });
      }
    }
  }, [slide, userId, addXP, currentSlideIndex, router]);

  if (!slide) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Caricamento o slide non trovata...
      </div>
    );
  }

  const isLast = currentSlideIndex === slides.length - 1;
  const progress = ((currentSlideIndex + 1) / slides.length) * 100;

  const handleComplete = async () => {
    // This logic might need to be moved or re-thought if the tutorial is now multi-page
    // For now, just redirect to home or a completion page
    if (userId) {
      await addXP('tutorial_completed', 100, {
        session_duration: 0, // Cannot track session duration easily across pages
        completion_rate: 100, // Assuming completion if they reach the end
        total_interactions: 0, // Cannot track total interactions easily across pages
        slides_viewed: slides.length,
        source: 'tutorial_page_completion'
      });

      await addXP('badge_earned', 50, {
        badge_id: 'tutorial_master',
        source: 'tutorial_page_completion'
      });
    }
    router.push('/'); // Redirect to home after completion
  };

  return (
    <div
      className="min-h-screen bg-gray-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
    >
      <div className="w-full sm:max-w-lg bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Header con Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">🎓</span>
              </div>
              <div>
                <div className="text-white/90 text-sm font-semibold">Tutorial MyCivitanova</div>
                <div className="text-white/60 text-xs">
                  Slide {currentSlideIndex + 1} di {slides.length}
                </div>
              </div>
            </div>
            <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">
              Chiudi
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
               style={{ width: `${progress}%` }} />
        </div>

        {/* Slide Content */}
        <div className={`px-6 py-8 bg-gradient-to-br ${slide.bg} min-h-[400px] flex flex-col`}>
          {/* Slide Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              {slide.emoji}
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold text-xl leading-tight mb-2">
                {slide.title}
              </h2>
              <p className="text-white/80 text-sm font-medium mb-3">
                {slide.subtitle}
              </p>
              <p className="text-white/70 text-sm leading-relaxed">
                {slide.description}
              </p>
            </div>
          </div>

          {/* Detailed Content */}
          <div className="flex-1 bg-black/20 rounded-xl p-4 mb-6 border border-white/10">
            <div className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
              {slide.detailedText}
            </div>
          </div>

          {/* XP Reward Badge */}
          {slide.xpReward && (
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-amber-400 to-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                +{slide.xpReward} XP per questa slide!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-gray-900/50">
          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {slides.map((s, i) => (
              <Link
                key={s.id}
                href={`/tutorial/${s.id}`}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === currentSlideIndex
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
                aria-label={`Vai alla slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 justify-end"> {/* Adjusted for spacing */}
              {currentSlideIndex > 0 && (
                <Link
                  href={`/tutorial/${slides[currentSlideIndex - 1].id}`}
                  className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Indietro
                </Link>
              )}

              {!isLast ? (
                <Link
                  href={`/tutorial/${slides[currentSlideIndex + 1].id}`}
                  className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-medium transition-all shadow-lg"
                >
                  {slide.ctaText || 'Avanti'}
                </Link>
              ) : (
                <button
                  onClick={handleComplete}
                  className="px-6 py-2 text-sm rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold transition-all shadow-lg"
                >
                  {slide.ctaText || 'Completa Tutorial!'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
