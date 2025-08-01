'use client';

import { Glasses } from 'lucide-react';

export const ARTeaser = () => {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="relative px-6 py-12 md:px-12 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0 md:mr-8">
                <div className="flex items-center mb-4">
                  <Glasses className="w-8 h-8 mr-3" />
                  <span className="text-sm font-semibold px-3 py-1 bg-white/20 rounded-full">
                    Coming Soon
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                  Augmented Reality Experience
                </h2>
                
                <p className="text-white/80 max-w-xl mb-6">
                  Get ready to explore Civitanova Marche like never before. Our upcoming AR feature
                  will let you discover hidden stories, historical facts, and city information
                  through your smartphone camera.
                </p>

                <button
                  className="px-6 py-3 bg-white text-indigo-700 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                  onClick={() => {/* Open modal logic */}}
                >
                  Learn More
                </button>
              </div>

              <div className="w-full md:w-1/3">
                <div className="aspect-[4/3] rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white/60 text-center px-4">
                    AR Preview Visual
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
