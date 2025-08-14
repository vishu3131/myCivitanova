"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { 
  Home, 
  Calendar, 
  Compass, 
  MapPin, 
  User, 
  Settings,
  Sparkles,
  X,
  Bell,
  Bus,
  Cloud,
  Heart,
  Search,
  HelpCircle,
  Camera,
  Share2,
  Wifi,
  Zap
} from 'lucide-react';

const pages = [
  // Navigazione principale
  { name: 'Home', path: '/', icon: Home, color: '#10B981', type: 'navigation' },
  { name: 'Esplora', path: '/esplora', icon: Compass, color: '#3B82F6', type: 'navigation' },
  { name: 'Eventi', path: '/eventi', icon: Calendar, color: '#F59E0B', type: 'navigation' },
  { name: 'Servizi', path: '/servizi', icon: Settings, color: '#8B5CF6', type: 'navigation' },
  { name: 'Mappa', path: '/mappa', icon: MapPin, color: '#EF4444', type: 'navigation' },
  { name: 'Profilo', path: '/profilo', icon: User, color: '#EC4899', type: 'navigation' },
  
  // Funzionalità rapide
  { name: 'Meteo', path: '#meteo', icon: Cloud, color: '#0EA5E9', type: 'quick' },
  { name: 'Trasporti', path: '#trasporti', icon: Bus, color: '#14B8A6', type: 'quick' },
  { name: 'Notifiche', path: '#notifiche', icon: Bell, color: '#F43F5E', type: 'quick' },
  { name: 'Cerca', path: '#cerca', icon: Search, color: '#8B5CF6', type: 'quick' },
  { name: 'Aiuto', path: '#aiuto', icon: HelpCircle, color: '#F97316', type: 'quick' },
  { name: 'Fotocamera', path: '#fotocamera', icon: Camera, color: '#6366F1', type: 'quick' },
  { name: 'Condividi', path: '#condividi', icon: Share2, color: '#0284C7', type: 'quick' },
  { name: 'Preferiti', path: '#preferiti', icon: Heart, color: '#E11D48', type: 'quick' },
  { name: 'Wi-Fi', path: '#wifi', icon: Wifi, color: '#059669', type: 'quick' },
  { name: 'Risparmio', path: '#risparmio', icon: Zap, color: '#FBBF24', type: 'quick' }
];

export function CircularDevNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const { triggerHaptic } = useHapticFeedback();
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timeouts = timeoutRefs.current;
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Close menu when clicking outside or on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
      setSelectedIcon(null);
      setIsAnimating(false);
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleNavigation = useCallback((path: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    triggerHaptic('medium');
    setSelectedIcon(path);
    
    const timeout = setTimeout(() => {
      router.push(path);
      setIsOpen(false);
      setSelectedIcon(null);
    }, 300);
    
    timeoutRefs.current.push(timeout);
  }, [router, triggerHaptic]);

  const handleCentralClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple rapid clicks
    if (isAnimating) return;
    
    setIsAnimating(true);
    triggerHaptic('heavy');
    setShowRipple(true);
    
    const rippleTimeout = setTimeout(() => setShowRipple(false), 600);
    const animationTimeout = setTimeout(() => setIsAnimating(false), 300);
    
    timeoutRefs.current.push(rippleTimeout, animationTimeout);
    
    setIsOpen(!isOpen);
    
    // Reset selected icon when closing
    if (isOpen) {
      setSelectedIcon(null);
    }
  }, [triggerHaptic, isOpen, isAnimating]);

  const handleBackdropClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    setSelectedIcon(null);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setSelectedIcon(null);
    }
  }, []);

  // Filtra le pagine in base al tipo
  const navigationPages = pages.filter(page => page.type === 'navigation');
  const quickPages = pages.filter(page => page.type === 'quick');
  
  // Calcola posizioni per un layout a semicerchio geometricamente centrato
  const getIconPosition = useCallback((index: number, total: number, type: 'navigation' | 'quick') => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Semicirconferenza da 180 a 0 gradi (da sinistra a destra)
    const startAngle = Math.PI; // 180 gradi
    const endAngle = 0; // 0 gradi
    const angleStep = (startAngle - endAngle) / (total - 1);
    const angle = startAngle - index * angleStep;

    if (type === 'navigation') {
      // Arco interno per la navigazione
      const radius = isMobile ? 100 : 130;
      const yOffset = isMobile ? -80 : -100;
      
      const x = Math.cos(angle) * radius;
      const y = -Math.sin(angle) * radius + yOffset;
      
      return { x, y };
    } else {
      // Arco esterno per le funzionalità rapide
      const radius = isMobile ? 160 : 200;
      const yOffset = isMobile ? -80 : -100;

      const x = Math.cos(angle) * radius;
      const y = -Math.sin(angle) * radius + yOffset;
      
      return { x, y };
    }
  }, []);

  // Mostra sempre il componente, sia in sviluppo che in produzione

  return (
    <>
      {/* Backdrop Blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 backdrop-blur-md bg-black/30 cursor-pointer touch-manipulation"
            style={{ 
              zIndex: 9995,
              WebkitTapHighlightColor: 'transparent'
            }}
            onClick={handleBackdropClick}
            onTouchEnd={handleBackdropClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Close navigation menu"
          />
        )}
      </AnimatePresence>

      {/* Floating particles background */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9996 }}>
            {[...Array(typeof window !== 'undefined' && window.innerWidth < 768 ? 15 : 30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 4 + 1,
                  height: Math.random() * 4 + 1,
                  background: `linear-gradient(45deg, ${pages[Math.floor(Math.random() * pages.length)].color}, ${pages[Math.floor(Math.random() * pages.length)].color}80)`,
                }}
                initial={{ 
                  opacity: 0,
                  scale: 0,
                  x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
                  y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0,
                }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.5, 0],
                  y: typeof window !== 'undefined' ? [Math.random() * window.innerHeight, Math.random() * window.innerHeight - 100] : [0, -100],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Ripple Effect */}
      <AnimatePresence>
        {showRipple && (
          <>
            {/* Primary ripple */}
            <motion.div
              className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full border-2 border-purple-400"
              style={{ zIndex: 9996 }}
              id="circular-origin-ripple-1"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            {/* Secondary ripple */}
            <motion.div
              className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full border border-pink-400"
              style={{ zIndex: 9996 }}
              id="circular-origin-ripple-2"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            />
            {/* Energy burst */}
            <motion.div
              className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full"
              style={{ 
                zIndex: 9996,
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)"
              }}
              id="circular-origin-ripple-3"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Central Button */}
      <motion.button
        onClick={handleCentralClick}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCentralClick(e as any);
        }}
        onKeyDown={handleKeyDown}
        className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-400 touch-manipulation"
        style={{ 
          zIndex: 9997,
          WebkitTapHighlightColor: 'transparent'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { 
          scale: 1.2,
        } : { 
          scale: 1 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          repeat: isOpen ? Infinity : 0,
          repeatType: "reverse",
          duration: 2
        }}
        aria-label={isOpen ? "Close development navigation" : "Open development navigation"}
        aria-expanded={isOpen}
        id="circular-origin"
        ref={(el) => {
          try {
            const target = document.getElementById('explore-fab');
            if (el && target) {
              const targetRect = target.getBoundingClientRect();
              const centerX = targetRect.left + targetRect.width / 2;
              el.style.left = `${centerX}px`;
              el.style.transform = 'translate(-50%, 0)';
            }
          } catch {}
        }}
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            background: isOpen 
              ? "linear-gradient(45deg, #8B5CF6, #EC4899)"
              : "linear-gradient(45deg, #8B5CF6, #EC4899)"
          }}
          transition={{ duration: 2, repeat: isOpen ? Infinity : 0, type: "tween" }}
        />
        
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={isOpen ? {
            boxShadow: "0 0 40px rgba(139, 92, 246, 0.7)"
          } : {
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)"
          }}
          transition={{ duration: 2, repeat: isOpen ? Infinity : 0, type: "tween" }}
        />

        {/* Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative z-10"
        >
          {isOpen ? (
            <X className="w-8 h-8 text-white" />
          ) : (
            <Settings className="w-8 h-8 text-white" />
          )}
        </motion.div>
      </motion.button>

      {/* Magnetic field effect */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 left-1/2 w-80 h-80 rounded-full pointer-events-none"
            style={{ 
              zIndex: 9995,
              background: "radial-gradient(circle, transparent 30%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)",
              transform: "translate(-50%, 50%)"
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              rotate: 360
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              scale: { duration: 0.5 },
              opacity: { duration: 0.3 },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
          />
        )}
      </AnimatePresence>

      {/* Menu di Navigazione Principale */}
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2"
            style={{ zIndex: 9996 }}
            role="navigation"
            aria-label="Menu di navigazione principale"
            id="circular-menu-anchor"
            ref={(el) => {
              try {
                const target = document.getElementById('explore-fab');
                if (el && target) {
                  const targetRect = target.getBoundingClientRect();
                  const centerX = targetRect.left + targetRect.width / 2;
                  el.style.left = `${centerX}px`;
                  el.style.transform = 'translate(-50%, 0)';
                }
              } catch {}
            }}
          >
            {navigationPages.map((page, index) => {
              const IconComponent = page.icon;
              const position = getIconPosition(index, navigationPages.length, 'navigation');
              
              return (
                <motion.button
                  key={page.path}
                  onClick={(e) => handleNavigation(page.path, e)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNavigation(page.path);
                  }}
                  className="absolute w-14 h-14 rounded-full flex items-center justify-center shadow-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/50 touch-manipulation"
                  style={{
                    background: `linear-gradient(135deg, ${page.color}, ${page.color}dd)`,
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  initial={{ 
                    scale: 0,
                    opacity: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={selectedIcon === page.path ? {
                    scale: 0,
                    rotate: 360,
                    opacity: 0,
                    x: position.x,
                    y: position.y,
                  } : { 
                    scale: 1,
                    opacity: 1,
                    x: position.x,
                    y: position.y,
                  }}
                  exit={{ 
                    scale: 0,
                    opacity: 0,
                    x: 0,
                    y: 0,
                    rotate: -180,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: index * 0.1,
                  }}
                  whileHover={{ 
                    scale: 1.2,
                    boxShadow: `0 0 25px ${page.color}80`,
                  }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Vai a ${page.name}`}
                >
                  {/* Glow effect for each icon */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: `0 0 15px ${page.color}50`
                    }}
                    transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                  />
                  
                  {/* Pulse ring on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 opacity-0"
                    style={{ borderColor: page.color }}
                    whileHover={{
                      opacity: 0.7,
                      scale: 1.3,
                    }}
                    transition={{ duration: 0.6, repeat: Infinity, type: "tween" }}
                  />
                  
                  {/* Icon */}
                  <IconComponent className="w-6 h-6 text-white relative z-10" />
                  
                  {/* Label */}
                  <motion.div
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 rounded-md backdrop-blur-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <span className="text-white text-xs font-medium whitespace-nowrap">
                      {page.name}
                    </span>
                  </motion.div>
                </motion.button>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Menu di Funzionalità Rapide */}
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2"
            style={{ zIndex: 9996 }}
            role="navigation"
            aria-label="Menu di funzionalità rapide"
            id="circular-quick-anchor"
            ref={(el) => {
              try {
                const target = document.getElementById('explore-fab');
                if (el && target) {
                  const targetRect = target.getBoundingClientRect();
                  const centerX = targetRect.left + targetRect.width / 2;
                  el.style.left = `${centerX}px`;
                  el.style.transform = 'translate(-50%, 0)';
                }
              } catch {}
            }}
          >
            {quickPages.map((page, index) => {
              const IconComponent = page.icon;
              const position = getIconPosition(index, quickPages.length, 'quick');
              
              return (
                <motion.button
                  key={page.path}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Gestione delle azioni rapide
                    if (page.path.startsWith('#')) {
                      // Azioni speciali basate sul tipo
                      switch(page.path) {
                        case '#meteo':
                          alert('Funzionalità meteo in arrivo!');
                          break;
                        case '#cerca':
                          alert('Funzionalità di ricerca in arrivo!');
                          break;
                        case '#notifiche':
                          alert('Centro notifiche in arrivo!');
                          break;
                        default:
                          alert(`Funzionalità ${page.name} in arrivo presto!`);
                      }
                    } else {
                      handleNavigation(page.path, e);
                    }
                  }}
                  className="absolute w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/50 touch-manipulation"
                  style={{
                    background: `linear-gradient(135deg, ${page.color}, ${page.color}dd)`,
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  initial={{ 
                    scale: 0,
                    opacity: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{ 
                    scale: 1,
                    opacity: 1,
                    x: position.x,
                    y: position.y,
                  }}
                  exit={{ 
                    scale: 0,
                    opacity: 0,
                    x: 0,
                    y: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: index * 0.05 + 0.2,
                  }}
                  whileHover={{ 
                    scale: 1.15,
                    boxShadow: `0 0 15px ${page.color}80`,
                  }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={page.name}
                >
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: `0 0 8px ${page.color}50`
                    }}
                    transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                  />
                  
                  {/* Icon */}
                  <IconComponent className="w-5 h-5 text-white relative z-10" />
                  
                  {/* Label */}
                  <motion.div
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 bg-black/80 rounded-md backdrop-blur-sm"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 + 0.3 }}
                  >
                    <span className="text-white text-[10px] font-medium whitespace-nowrap">
                      {page.name}
                    </span>
                  </motion.div>
                </motion.button>
              );
            })}
          </div>
        )}
      </AnimatePresence>
      
      {/* Trail effect */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2" style={{ zIndex: 9994 }} id="circular-trail-anchor">
            {navigationPages.map((page, index) => {
              const position = getIconPosition(index, navigationPages.length, 'navigation');
              
              return (
                <motion.div
                  key={`trail-${page.path}`}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ background: page.color }}
                  initial={{ 
                    opacity: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{ 
                    opacity: 0.4,
                    x: position.x,
                    y: position.y,
                  }}
                  transition={{
                    duration: 1,
                    delay: index * 0.05,
                    repeat: Infinity,
                  }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Stardust explosion effect */}
      <AnimatePresence>
        {selectedIcon && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2" style={{ zIndex: 9998 }} id="circular-stardust-anchor">
            {[...Array(12)].map((_, i) => {
              const angle = (Math.PI * 2 / 12) * i;
              const distance = 60;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;
              
              return (
                <motion.div
                  key={`star-${i}`}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  initial={{ 
                    opacity: 1,
                    scale: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{ 
                    opacity: 0,
                    scale: 1,
                    x: x,
                    y: y,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.02,
                    ease: "easeOut",
                  }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
