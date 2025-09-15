'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Bell, Plus, Compass, Map, Waves, ShoppingBag, Percent, Wrench, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

// Icona centrale sostituita con il widget Uiverse.io (GreyD097), adattata e scalata
const UniverseCenterIcon: React.FC<{ open: boolean }> = () => {
  return (
    <div className="universe-icon-wrapper">
      {/* From Uiverse.io by GreyD097 */}
      <div className="button-box">
        <div className="touch left" />
        <div className="touch middle" />
        <div className="touch right" />

        <div className="button">
          <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M446.208 566.72h369.28c-2.944 103.808-39.36 190.72-109.376 260.736s-156.608 106.432-259.904 109.376c-103.808-2.944-190.72-39.36-260.736-109.376s-106.432-156.928-109.376-260.736c2.944-103.232 39.36-189.888 109.376-259.904S342.4 200.448 446.208 197.504v369.216z m383.296-383.232c70.016 70.016 106.432 156.928 109.376 260.736H568.704V74.112c103.872 2.944 190.784 39.36 260.8 109.376z"
              fill="#ffffff"
            />
          </svg>
        </div>

        <div className="button">
          <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M773.907692 992.768h-590.76923c-48.864492 0-88.615385-39.754831-88.615385-88.615385V120.032492c0-48.852677 39.743015-88.615385 88.599631-88.631138l379.076923-0.169354h0.047261c35.233477 0 78.217846 18.699815 102.230646 44.480985l158.0032 169.621661C845.686154 270.245415 862.523077 313.040738 862.523077 347.096615v300.780308c0 27.1872-22.043569 49.230769-49.230769 49.230769s-49.230769-22.043569-49.23077-49.230769V347.096615c0-9.168738-7.388554-27.951262-13.627076-34.650584l-158.011077-169.6256c-5.490215-5.891938-22.122338-13.126892-30.176493-13.126893h-0.003938L192.984615 129.858954V894.306462h571.076923V805.415385c0-27.1872 22.043569-49.230769 49.23077-49.23077s49.230769 22.043569 49.230769 49.23077v98.73723c0 48.864492-39.754831 88.615385-88.615385 88.615385z"
              className="selected"
              fill="#ffffff"
            />
            <path
              d="M414.802708 753.829415a49.092923 49.092923 0 0 1-34.812062-14.418707l-90.289231-90.285293c-19.223631-19.223631-19.227569-50.396554 0-69.624123 19.223631-19.223631 50.396554-19.223631 69.624123 0l55.47717 55.473231 187.7504-187.746461c19.227569-19.223631 50.396554-19.219692 69.624123 0 19.227569 19.227569 19.227569 50.396554 0 69.624123l-222.562462 222.558523a49.073231 49.073231 0 0 1-34.812061 14.418707z"
              fill="#ffffff"
            />
          </svg>
        </div>

        <div className="button">
          <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M793.6 678.4c29.866667-51.2 81.066667-76.8 132.266667-72.533333 8.533333-29.866667 12.8-64 12.8-98.133334 0-29.866667-4.266667-59.733333-8.533334-85.333333-51.2 8.533333-106.666667-21.333333-136.533333-72.533333-29.866667-51.2-25.6-115.2 8.533333-153.6-46.933333-42.666667-98.133333-72.533333-157.866666-93.866667-17.066667 51.2-68.266667 85.333333-132.266667 85.333333s-110.933333-34.133333-132.266667-85.333333c-59.733333 21.333333-110.933333 55.466667-157.866666 98.133333 34.133333 42.666667 38.4 102.4 8.533333 153.6-29.866667 51.2-85.333333 76.8-136.533333 68.266667-4.266667 29.866667-8.533333 59.733333-8.533334 89.6 0 34.133333 4.266667 64 12.8 93.866667 51.2-4.266667 102.4 21.333333 132.266667 72.533333 25.6 51.2 25.6 106.666667-4.266667 149.333333 46.933333 42.666667 98.133333 72.533333 157.866667 89.6 21.333333-46.933333 68.266667-76.8 128-76.8s106.666667 29.866667 128 76.8c59.733333-17.066667 110.933333-51.2 157.866667-89.6-29.866667-42.666667-34.133333-98.133333-4.266667-149.333333z m-281.6 17.066667c-102.4 0-183.466667-81.066667-183.466667-183.466667S409.6 328.533333 512 328.533333s183.466667 81.066667 183.466667 183.466667-81.066667 183.466667-183.466667 183.466667z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>

      <style jsx>{`
        /* Wrapper adattato al bottone da 64px */
        .universe-icon-wrapper {
          position: relative;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* From Uiverse.io by GreyD097 */
        .button-box {
          position: relative;
          width: 12rem;
          height: 5rem;
          display: flex;
          transform: scale(0.3);
          transform-origin: center;
        }
        .button-box .button {
          width: 3.2rem;
          height: 3.2rem;
          position: absolute;
          left: 50%;
          top: 50%;
          cursor: default;
          border: 3px solid #311703;
          border-radius: 5px;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: 0.3s;
          opacity: 0.85;
          box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.4);
        }
        .button-box .button .icon {
          width: 24px;
          height: 24px;
          opacity: 0.7;
          transition: 0.25s;
        }
        .button-box .button:nth-child(4) {
          transform: translate(-50%, -50%) rotate(90deg);
          z-index: 30;
          background: #ff7f50;
        }
        .button-box .button:nth-child(5) {
          transform: translate(-50%, -50%) rotate(-115deg);
          z-index: 40;
          background: #ffd700;
        }
        .button-box .button:nth-child(6) {
          transform: translate(-50%, -50%) rotate(-45deg);
          z-index: 50;
          background: #019b98;
        }
        .button-box .button:nth-child(6) .icon {
          animation: active 2.2s linear infinite;
        }
        .button-box .touch {
          position: relative;
          z-index: 60;
          height: 100%;
          flex: 1;
        }
        .button-box .touch.left:hover ~ .button:nth-child(4) {
          opacity: 1;
          transform: translate(-170%, -50%) rotate(-90deg) scale(1.05);
        }
        .button-box .touch.left:hover ~ .button:nth-child(4) .icon {
          width: 25px;
          opacity: 0.9;
        }
        .button-box .touch.left:active ~ .button:nth-child(4) {
          transform: translate(-170%, -50%) rotate(-90deg) scale(0.9);
        }
        .button-box .touch.right:hover ~ .button:nth-child(5) {
          opacity: 1;
          transform: translate(70%, -50%) rotate(90deg) scale(1.05);
        }
        .button-box .touch.right:hover ~ .button:nth-child(5) .icon {
          width: 25px;
          opacity: 0.9;
        }
        .button-box .touch.right:active ~ .button:nth-child(5) {
          transform: translate(70%, -50%) rotate(90deg) scale(0.9);
        }
        .button-box .touch.middle:hover ~ .button:nth-child(6) {
          opacity: 1;
          transform: translate(-50%, -50%) rotate(0deg) scale(1.05);
        }
        .button-box .touch.middle:hover ~ .button:nth-child(6) .icon {
          width: 25px;
          opacity: 0.9;
        }
        .button-box .touch.middle:active ~ .button:nth-child(6) {
          transform: translate(-50%, -50%) rotate(0deg) scale(0.9);
        }
        .button-box:hover .button:nth-child(4) {
          transform: translate(-170%, -50%) rotate(-90deg);
        }
        .button-box:hover .button:nth-child(5) {
          transform: translate(70%, -50%) rotate(90deg);
        }
        .button-box:hover .button:nth-child(6) {
          transform: translate(-50%, -50%) rotate(0deg);
        }
        .button-box:hover .button:nth-child(6) .icon {
          animation: active 4s linear infinite;
        }
        @keyframes active {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export function BottomNavbar() {
  const pathname = usePathname();
  const { triggerHaptic } = useHapticFeedback();
  const [menuOpen, setMenuOpen] = useState(false);

  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Calendar, label: 'Eventi', href: '/eventi' },
    { icon: Plus, label: 'Menu', href: '#', special: true },
    { icon: Users, label: 'Community', href: '/community' },
    { icon: Bell, label: 'Notifiche', href: '/news', notify: true },
  ] as const;

  const isActive = (href: string) => href !== '#' && (pathname === href || pathname.startsWith(href + "/"));

  const hasUnreadNotifications = true;

  // Voci del menu circolare (radiale)
  const radialItems = useMemo(
    () => [
      { icon: Compass, label: 'Esplora', href: '/esplora', color: 'bg-white text-black' },
      { icon: Map, label: 'Mappa', href: '/mappa', color: 'bg-cyan-500 text-white' },
      { icon: Wrench, label: 'Servizi', href: '/servizi', color: 'bg-purple-500 text-white' },
      { icon: Waves, label: 'Spiaggia', href: '/spiaggia', color: 'bg-blue-500 text-white' },
      { icon: Percent, label: 'Sconti', href: '/sconti', color: 'bg-emerald-500 text-white' },
      { icon: ShoppingBag, label: 'Marketplace', href: '/marketplace', color: 'bg-amber-500 text-white' },
      { icon: User, label: 'Profilo', href: '/profilo', color: 'bg-gradient-to-br from-pink-500 to-purple-600 text-white' },
    ],
    []
  );

  // Rileva larghezza viewport per geometria responsive del menu radiale
  const [vw, setVw] = useState(0);
  useEffect(() => {
    const set = () => setVw(typeof window !== 'undefined' ? window.innerWidth : 0);
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, []);

  const geom = useMemo(() => {
    const w = vw || 360;
    const itemCount = radialItems.length;
    
    // Geometria ottimizzata per 7 elementi con migliore distribuzione
    const span = w < 360 ? 180 : w < 400 ? 175 : w < 480 ? 170 : 165;
    // Raggio adattivo basato sulla larghezza dello schermo e numero di elementi
    const r = w < 360 ? 120 : w < 400 ? 130 : w < 480 ? 140 : 150;
    
    const arcStart = -90 - span / 2;
    const arcEnd = -90 + span / 2;
    const centerY = r + 15; // Maggiore distanza dal bordo
    
    // Container più ampio per accogliere tutti gli elementi
    const containerW = Math.min(Math.max(r * 2.8, 280), 380);
    const containerH = r + 80; // Più spazio per le label
    
    return { r, arcStart, arcEnd, centerY, containerW, containerH };
  }, [vw, radialItems.length]);

  // Chiudi menu con ESC e clic fuori
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <motion.nav
      initial={{ y: 72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      role="navigation"
      aria-label="Navigazione principale"
    >
      <div className="pointer-events-auto mx-auto max-w-lg rounded-t-2xl bg-[rgba(12,12,14,0.5)] bg-gradient-to-b from-white/[0.08] via-white/[0.06] to-white/[0.03] backdrop-blur-2xl backdrop-saturate-150 border-t border-white/15 ring-1 ring-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.6)] px-4 pb-[env(safe-area-inset-bottom)] relative overflow-visible">
        <div aria-hidden className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-20%,rgba(255,255,255,0.18),transparent)] opacity-40" />

        <div className="relative z-10 grid grid-cols-5 h-20 items-center">
          {items.map(({ icon: Icon, href, special, notify, label }) => {
            const active = isActive(href);
            if (special) {
              return <div key={href} aria-hidden className="pointer-events-none" />;
            }
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                onClick={() => triggerHaptic('light')}
                className="relative block"
                title={label}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.06 }}
                  className="relative flex flex-col items-center justify-center will-change-transform"
                >
                  <Icon className={`w-6 h-6 transition-colors ${active ? 'text-[#D8FF00]' : 'text-gray-400'} drop-shadow-[0_0_6px_rgba(216,255,0,0.15)]`} />
                  {active && (
                    <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#D8FF00] shadow-[0_0_8px_3px_rgba(216,255,0,0.5)]" />
                  )}
                  {notify && hasUnreadNotifications && !active && (
                    <>
                      <span className="absolute -top-1.5 right-4 w-2 h-2 bg-red-500 rounded-full" />
                      <span className="absolute -top-2 right-3 w-3 h-3 bg-red-500/60 rounded-full animate-ping" />
                    </>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Effetto Uiverse come sfondo del pulsante centrale */}
        <div aria-hidden className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 w-24 h-24 z-10">
          <div className="uiverse-glow">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* Pulsante centrale che apre il menu circolare */}
        <button
          aria-label="Apri menu rapido"
          aria-expanded={menuOpen}
          onClick={() => {
            setMenuOpen(v => !v);
            triggerHaptic('medium');
          }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            animate={{ scale: menuOpen ? 1.05 : [1, 1.03, 1] }}
            transition={{ duration: menuOpen ? 0.2 : 2.2, repeat: menuOpen ? 0 : Infinity, ease: 'easeInOut' }}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-xl ring-1 ring-black/10 will-change-transform ${menuOpen ? 'bg-[#D8FF00] text-black shadow-[0_0_25px_rgba(216,255,0,0.55)]' : 'bg-white/95 text-black'}`}
          >
            <UniverseCenterIcon open={menuOpen} />
          </motion.div>
        </button>
      </div>

      {/* Overlay + Menu circolare */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
          >
            {/* Clic fuori per chiudere */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />

            {/* Contenitore del menu radiale, posizionato sopra la navbar con margini di sicurezza */}
            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ bottom: `${Math.max(100, vw * 0.12)}px` }}>
              {/* Cerchio guida/effetto */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="relative radial-menu-container"
                style={{ width: geom.containerW, height: geom.containerH }}
                aria-label="Menu rapido circolare"
                role="menu"
              >
                {/* Pulsazioni decorative */}
                <div className="pointer-events-none absolute inset-0 rounded-full opacity-60" style={{ background: 'radial-gradient(circle at center, rgba(216,255,0,0.20), transparent 70%)' }} />

                {/* Voci disposte ad arco con algoritmo di posizionamento ottimizzato */}
                {radialItems.map((item, i) => {
                  const total = radialItems.length;
                  const angle = geom.arcStart + (i * (geom.arcEnd - geom.arcStart)) / (total - 1);
                  const rad = (angle * Math.PI) / 180;
                  const radius = geom.r;
                  const x = Math.cos(rad) * radius;
                  const y = Math.sin(rad) * radius;

                  // Algoritmo migliorato per posizionamento label con controllo collisioni
                  let labelOffsetY = 0;
                  let labelOffsetX = 0;
                  
                  // Posizionamento intelligente basato su angolo e posizione
                  if (angle < -135) {
                    // Estrema sinistra
                    labelOffsetY = 20;
                    labelOffsetX = -8;
                  } else if (angle < -105) {
                    // Sinistra
                    labelOffsetY = 16;
                    labelOffsetX = -4;
                  } else if (angle < -75) {
                    // Centro-sinistra
                    labelOffsetY = 12;
                  } else if (angle < -45) {
                    // Centro-destra
                    labelOffsetY = 12;
                  } else if (angle < -15) {
                    // Destra
                    labelOffsetY = 16;
                    labelOffsetX = 4;
                  } else {
                    // Estrema destra
                    labelOffsetY = 20;
                    labelOffsetX = 8;
                  }

                  const Icon = item.icon;

                   return (
                     <motion.div
                       key={item.href}
                       initial={{ opacity: 0, x: 0, y: 0, scale: 0.5, rotate: -10 }}
                       animate={{ opacity: 1, x, y, scale: 1, rotate: 0 }}
                       exit={{ opacity: 0, x: 0, y: 0, scale: 0.5, rotate: 10 }}
                       transition={{ 
                         delay: 0.04 * i, 
                         type: 'spring', 
                         stiffness: 350, 
                         damping: 25,
                         duration: 0.6
                       }}
                       className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto radial-menu-item"
                        style={{ top: geom.centerY }}
                     >
                       <Link
                         href={item.href}
                         onClick={() => {
                           triggerHaptic('light');
                           setMenuOpen(false);
                         }}
                         role="menuitem"
                         aria-label={item.label}
                         className="group flex flex-col items-center gap-1 touch-manipulation"
                       >
                         <motion.div
                           whileHover={{ scale: 1.1 }}
                           whileTap={{ scale: 0.95 }}
                           className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-white/20 ${item.color} backdrop-blur-sm`}
                         >
                           <Icon className="w-5 h-5" />
                         </motion.div>
                         <span
                            className="text-white text-xs font-medium opacity-90 group-hover:opacity-100 radial-menu-label whitespace-nowrap"
                            style={{
                              transform: `translate(${labelOffsetX}px, ${labelOffsetY}px)`,
                            }}
                          >
                            {item.label}
                          </span>
                       </Link>
                     </motion.div>
                   );
})}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        /* From Uiverse.io by terenceodonoghue (adattato) */
        .uiverse-glow {
          position: relative;
          border-radius: 50%;
          height: 96px;
          width: 96px;
          animation: rotate_3922 1.2s linear infinite;
          background-color: #9b59b6;
          background-image: linear-gradient(#9b59b6, #84cdfa, #5ad1cd);
          filter: saturate(1.1);
        }
        .uiverse-glow span {
          position: absolute;
          border-radius: 50%;
          height: 100%;
          width: 100%;
          background-color: #9b59b6;
          background-image: linear-gradient(#9b59b6, #84cdfa, #5ad1cd);
        }
        .uiverse-glow span:nth-of-type(1) { filter: blur(5px); }
        .uiverse-glow span:nth-of-type(2) { filter: blur(10px); }
        .uiverse-glow span:nth-of-type(3) { filter: blur(25px); }
        .uiverse-glow span:nth-of-type(4) { filter: blur(50px); }
        .uiverse-glow::after {
          content: "";
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          background-color: #fff;
          border: solid 5px #ffffff;
          border-radius: 50%;
        }
        @keyframes rotate_3922 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.nav>
  );
}
