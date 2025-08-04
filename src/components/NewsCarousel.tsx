"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, MessageCircle, Share2 } from "lucide-react";

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  source: string;
  type: "urgent" | "news" | "event";
}

const demoItems: CarouselItem[] = [
  {
    id: 1,
    title: "LAVORI STRADALI: Via Dante chiusa fino al 15 agosto",
    description: "Prestare attenzione alle deviazioni segnalate.",
    timestamp: "2 ore fa",
    source: "Ufficio Tecnico",
    type: "urgent",
  },
  {
    id: 2,
    title: "Festa di San Giuliano – Programma completo degli eventi",
    description: "Concerti, stand gastronomici e fuochi d'artificio in piazza.",
    timestamp: "ieri",
    source: "Comune di Civitanova",
    type: "event",
  },
  {
    id: 3,
    title: "Nuova pista ciclabile inaugurata sul lungomare",
    description: "Percorso panoramico di 3km con vista sul mare.",
    timestamp: "3 giorni fa",
    source: "Civitanova Today",
    type: "news",
  },
];

const typeStyles = {
  urgent: {
    icon: "⚠️",
    bg: "bg-[#E76F51]/10",
    text: "text-[#E76F51]",
  },
  event: {
    icon: "📅",
    bg: "bg-[#2A9D8F]/10",
    text: "text-[#2A9D8F]",
  },
  news: {
    icon: "📰",
    bg: "bg-[#0077BE]/10",
    text: "text-[#0077BE]",
  },
};

export function NewsCarousel({ items = demoItems }: { items?: CarouselItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  const paginate = (direction: number) => {
    setIndex((prev) => (prev + direction + items.length) % items.length);
  };

  const current = items[index];
  const style = typeStyles[current.type];

  return (
    <div className="relative w-full h-60 overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={current.id}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 p-6 flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${style.bg} ${style.text}`}>{style.icon}</div>
            <div className="text-xs text-gray-400">
              <span>{current.timestamp}</span>
              <span className="mx-1">•</span>
              <span>{current.source}</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mt-4 line-clamp-2">{current.title}</h3>
          <p className="text-sm text-gray-300 line-clamp-3 mt-2">{current.description}</p>

          <div className="flex gap-6 mt-4">
            <ThumbsUp className="w-5 h-5 text-yellow-400" />
            <ThumbsDown className="w-5 h-5 text-yellow-400" />
            <MessageCircle className="w-5 h-5 text-yellow-400" />
            <Share2 className="w-5 h-5 text-yellow-400" />
          </div>
        </motion.div>
      </AnimatePresence>

      <button onClick={() => paginate(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center">←</button>
      <button onClick={() => paginate(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center">→</button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {items.map((_, i) => (
          <span key={i} className={`w-2 h-2 rounded-full ${i === index ? "bg-yellow-400" : "bg-white/30"}`} />
        ))}
      </div>
    </div>
  );
}

export default NewsCarousel;