"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Sun, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IntegratedWidgetBar } from './IntegratedWidgetBar';
import WalkingTimeWidget from './WalkingTimeWidget';

interface InfoCardsProps {
  onReportClick?: () => void;
}

export function InfoCards({ onReportClick }: InfoCardsProps) {
  const router = useRouter();
  const [heartActive, setHeartActive] = useState(false);

  return (
    <div style={{ paddingLeft: '24px', paddingRight: '24px', marginTop: '24px' }}>
       <div className="grid grid-cols-2 gap-4">
        {/* Card immagine luogo - Centro */}
        <div className="relative h-[200px] rounded-[20px] overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300">
          <Image
            src="https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            alt="Centro Civitanova"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/70 transition-all duration-300"></div>
          <div className="absolute bottom-3 left-4 transform group-hover:translate-y-[-2px] transition-transform duration-300">
            <span className="text-white text-base font-semibold drop-shadow-lg">Centro</span>
          </div>
        </div>

        {/* Card percorso - sostituita con widget dinamico a scorrimento */}
        <WalkingTimeWidget />
        {/* Widget Bar Integrato */}
        <IntegratedWidgetBar 
          onEventClick={() => console.log('Eventi clicked')}
          onParkingClick={() => console.log('Parcheggi clicked')}
          onBeachClick={() => console.log('Spiagge clicked')}
          onReportClick={onReportClick}
        />

        {/* Card meteo */}
        <div className="h-[100px] rounded-[20px] p-4 flex flex-col justify-between cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
             style={{
               background: 'linear-gradient(135deg, #93F9B9, #1D976C)',
             }}>
          <div className="flex items-center justify-between">
            <Sun className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-white/70 text-xs group-hover:text-white/90 transition-colors duration-200">14:30</span>
          </div>
          <div>
            <span className="text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-200 inline-block">24°C</span>
          </div>
        </div>

        {/* Card servizi */}
        <div 
          className="h-[100px] rounded-[20px] p-4 flex flex-col justify-between cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
          }}
          onClick={() => router.push('/servizi')}
        >
          <div className="flex items-center justify-between">
            <Settings className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-200 group-hover:rotate-90" />
            <span className="text-white/70 text-xs group-hover:text-white/90 transition-colors duration-200">Disponibili</span>
          </div>
          <div>
            <span className="text-white text-sm font-medium group-hover:text-white transition-colors duration-200">Servizi</span>
          </div>
        </div>

        {/* Love Heart widget (Uiverse.io by barisdogansutcu) + Heart Animation on toggle */}
        <div className="h-[100px] flex items-center justify-center bg-transparent relative">
          {!heartActive ? (
            <>
              <div className="love relative">
                <input id="love-switch" type="checkbox" onChange={(e) => { if (e.target.checked) { setTimeout(() => setHeartActive(true), 1300); } }} />
                <label className="love-heart" htmlFor="love-switch">
                  <i className="left"></i>
                  <i className="right"></i>
                  <i className="bottom"></i>
                  <div className="round"></div>
                </label>
              </div>
              <style jsx>{`
                /* From Uiverse.io by barisdogansutcu */
                .love-heart:before, #love-switch {
                  display: none;
                }
                .love-heart, .love-heart::after {
                  border-color: hsl(231deg 28% 86%);
                  border: 1px solid;
                  border-top-left-radius: 100px;
                  border-top-right-radius: 100px;
                  width: 10px;
                  height: 8px;
                  border-bottom: 0;
                }
                .round {
                  position: absolute;
                  z-index: 1;
                  width: 8px;
                  height: 8px;
                  background: hsl(0deg 0% 100%);
                  box-shadow: rgb(0 0 0 / 24%) 0px 0px 4px 0px;
                  border-radius: 100%;
                  left: 0px;
                  bottom: -1px;
                  transition: all 1.2s ease;
                  animation: check-animation2 1.2s forwards;
                }
                input:checked + label .round {
                  transform: translate(0px, 0px);
                  animation: check-animation 1.2s forwards;
                  background-color: hsl(0deg 0% 100%);
                }
                @keyframes check-animation {
                  0% { transform: translate(0px, 0px); }
                  50% { transform: translate(0px, 7px); }
                  100% { transform: translate(7px, 7px); }
                }
                @keyframes check-animation2 {
                  0% { transform: translate(7px, 7px); }
                  50% { transform: translate(0px, 7px); }
                  100% { transform: translate(0px, 0px); }
                }
                .love-heart {
                  box-sizing: border-box;
                  position: relative;
                  transform: rotate(-45deg) translate(-50%, -33px) scale(4);
                  display: block;
                  border-color: hsl(231deg 28% 86%);
                  cursor: pointer;
                  top: 0;
                }
                input:checked + .love-heart, 
                input:checked + .love-heart::after, 
                input:checked + .love-heart .bottom {
                  border-color: hsl(347deg 81% 61%);
                  box-shadow: inset 6px -5px 0px 2px hsl(347deg 99% 72%);
                }
                .love-heart::after, .love-heart .bottom {
                  content: "";
                  display: block;
                  box-sizing: border-box;
                  position: absolute;
                  border-color: hsl(231deg 28% 86%);
                }
                .love-heart::after {
                  right: -9px;
                  transform: rotate(90deg);
                  top: 7px;
                }
                .love-heart .bottom {
                  width: 11px;
                  height: 11px;
                  border-left: 1px solid;
                  border-bottom: 1px solid;
                  border-color: hsl(231deg 28% 86%);
                  left: -1px;
                  top: 5px;
                  border-radius: 0px 0px 0px 5px;
                }
              `}</style>
            </>
          ) : (
            <>
              {/* From Uiverse.io by SouravBandyopadhyay */}
              <div className="cssload-main">
                <div className="cssload-heart">
                  <span className="cssload-heartL"></span>
                  <span className="cssload-heartR"></span>
                  <span className="cssload-square"></span>
                </div>
                <div className="cssload-shadow"></div>
              </div>
              <style jsx>{`
                /* From Uiverse.io by SouravBandyopadhyay */
                .cssload-main {
                  position: relative;
                  width: 124px;
                  height: 124px;
                }
                .cssload-main * { font-size: 62px; }
                .cssload-heart {
                  animation: cssload-heart 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
                  top: 50%;
                  left: 50%;
                  position: absolute;
                  transform: translate(-50%, -65%);
                }
                .cssload-heartL {
                  width: 1em;
                  height: 1em;
                  border: 1px solid rgb(252, 0, 101);
                  background-color: rgb(252, 0, 101);
                  content: '';
                  position: absolute;
                  display: block;
                  border-radius: 100%;
                  animation: cssload-heartL 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
                  transform: translate(-28px, -27px);
                }
                .cssload-heartR {
                  width: 1em;
                  height: 1em;
                  border: 1px solid rgb(252, 0, 101);
                  background-color: rgb(252, 0, 101);
                  content: '';
                  position: absolute;
                  display: block;
                  border-radius: 100%;
                  transform: translate(28px, -27px);
                  animation: cssload-heartR 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
                }
                .cssload-square {
                  width: 1em;
                  height: 1em;
                  border: 1px solid rgb(252, 0, 101);
                  background-color: rgb(252, 0, 101);
                  position: relative;
                  display: block;
                  content: '';
                  transform: scale(1) rotate(-45deg);
                  animation: cssload-square 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
                }
                .cssload-shadow {
                  left: 50%;
                  position: absolute;
                  bottom: 2px;
                  transform: translateX(-50%);
                  width: 1em;
                  height: .24em;
                  background-color: rgb(215,215,215);
                  border: 1px solid rgb(215,215,215);
                  border-radius: 50%;
                  animation: cssload-shadow 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
                }
                @keyframes cssload-square {
                  50% { border-radius: 100%; transform: scale(0.5) rotate(-45deg); }
                  100% { transform: scale(1) rotate(-45deg); }
                }
                @keyframes cssload-heart {
                  50% { transform: translate(-50%, -65%) rotate(360deg); }
                  100% { transform: translate(-50%, -65%) rotate(720deg); }
                }
                @keyframes cssload-heartL { 60% { transform: translate(-28px, -27px) scale(0.4); } }
                @keyframes cssload-heartR { 40% { transform: translate(28px, -27px) scale(0.4); } }
                @keyframes cssload-shadow { 50% { transform: translateX(-50%) scale(0.5); border-color: rgb(228,228,228); } }
              `}</style>
            </>
          )}
        </div>
      </div>
    </div>
  );
}