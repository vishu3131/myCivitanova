"use client";

import React, { useState } from 'react';
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
  X
} from 'lucide-react';

const pages = [
  { name: 'Home', path: '/', icon: Home, color: '#10B981' },
  { name: 'Esplora', path: '/esplora', icon: Compass, color: '#3B82F6' },
  { name: 'Eventi', path: '/eventi', icon: Calendar, color: '#F59E0B' },
  { name: 'Servizi', path: '/servizi', icon: Settings, color: '#8B5CF6' },
  { name: 'Mappa', path: '/mappa', icon: MapPin, color: '#EF4444' },
  { name: 'Profilo', path: '/profilo', icon: User, color: '#EC4899' },
];

export function CircularDevNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const router = useRouter();
  const { triggerHaptic } = useHapticFeedback();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleNavigation = (path: string) => {
    triggerHaptic('medium');
    setSelectedIcon(path);
    setTimeout(() => {
      router.push(path);
      setIsOpen(false);
      setSelectedIcon(null);
    }, 300);
  };

  const handleCentralClick = () => {
    triggerHaptic('heavy');
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 600);
    setIsOpen(!isOpen);
  };

  // Calculate positions for semicircle layout
  const getIconPosition = (index: number, total: number) => {
    const angle = (Math.PI / (total - 1)) * index; // Semicircle from 0 to π
    const radius = 120;
    const x = Math.cos(angle) * radius;
    const y = -Math.sin(angle) * radius; // Negative for upward semicircle
    return { x, y };
  };

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
            className="fixed inset-0 backdrop-blur-md bg-black/20"
            style={{ zIndex: 9995 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating particles background */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9996 }}>
            {[...Array(30)].map((_, i) => (
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
                  y: [null, -100],
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
              className="fixed bottom-24 right-6 w-16 h-16 rounded-full border-2 border-purple-400"
              style={{ zIndex: 9996 }}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            {/* Secondary ripple */}
            <motion.div
              className="fixed bottom-24 right-6 w-16 h-16 rounded-full border border-pink-400"
              style={{ zIndex: 9996 }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            />
            {/* Energy burst */}
            <motion.div
              className="fixed bottom-24 right-6 w-16 h-16 rounded-full"
              style={{ 
                zIndex: 9996,
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)"
              }}
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
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl overflow-hidden"
        style={{ zIndex: 9997 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { 
          scale: [1.2, 1.3, 1.2],
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
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            background: isOpen 
              ? [
                  "linear-gradient(45deg, #8B5CF6, #EC4899)",
                  "linear-gradient(45deg, #EC4899, #10B981)",
                  "linear-gradient(45deg, #10B981, #3B82F6)",
                  "linear-gradient(45deg, #3B82F6, #8B5CF6)"
                ]
              : "linear-gradient(45deg, #8B5CF6, #EC4899)"
          }}
          transition={{ duration: 2, repeat: isOpen ? Infinity : 0 }}
        />
        
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={isOpen ? {
            boxShadow: [
              "0 0 20px rgba(139, 92, 246, 0.5)",
              "0 0 40px rgba(236, 72, 153, 0.7)",
              "0 0 60px rgba(16, 185, 129, 0.5)",
              "0 0 40px rgba(139, 92, 246, 0.7)"
            ]
          } : {
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)"
          }}
          transition={{ duration: 2, repeat: isOpen ? Infinity : 0 }}
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
            <Sparkles className="w-8 h-8 text-white" />
          )}
        </motion.div>
      </motion.button>

      {/* Magnetic field effect */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-80 h-80 rounded-full pointer-events-none"
            style={{ 
              zIndex: 9995,
              background: "radial-gradient(circle, transparent 30%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)",
              transform: "translate(-50%, 50%)"
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              rotate: [0, 360]
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

      {/* Circular Menu Icons */}
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed bottom-24 right-6"
            style={{ zIndex: 9996 }}
          >
            {pages.map((page, index) => {
              const IconComponent = page.icon;
              const position = getIconPosition(index, pages.length);
              
              return (
                <motion.button
                  key={page.path}
                  onClick={() => handleNavigation(page.path)}
                  className="absolute w-14 h-14 rounded-full flex items-center justify-center shadow-xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${page.color}, ${page.color}dd)`,
                  }}
                  initial={{ 
                    scale: 0,
                    opacity: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={selectedIcon === page.path ? {
                    scale: [1, 1.5, 0],
                    rotate: [0, 180, 360],
                    opacity: [1, 1, 0],
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
                >
                  {/* Glow effect for each icon */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        `0 0 10px ${page.color}40`,
                        `0 0 20px ${page.color}60`,
                        `0 0 10px ${page.color}40`,
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* Pulse ring on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 opacity-0"
                    style={{ borderColor: page.color }}
                    whileHover={{
                      opacity: [0, 1, 0],
                      scale: [1, 1.3, 1.6],
                    }}
                    transition={{ duration: 0.6, repeat: Infinity }}
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

      {/* Trail effect */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-24 right-6" style={{ zIndex: 9994 }}>
            {pages.map((page, index) => {
              const position = getIconPosition(index, pages.length);
              
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
                    opacity: [0, 0.6, 0],
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
          <div className="fixed bottom-24 right-6" style={{ zIndex: 9998 }}>
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
                    opacity: [1, 1, 0],
                    scale: [0, 1, 0],
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