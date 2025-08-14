"use client";

import React, { useEffect, useState } from "react";
import CustomShapeWidget from "./CustomShapeWidget"; // Using the renamed generic widget

// Mock data for demonstration
const mockUsers = [
  { id: 1, name: "Alice", xp: 1250, avatar: "/images/avatar-1.png" },
  { id: 2, name: "Bob", xp: 1100, avatar: "/images/avatar-2.png" },
  { id: 3, name: "Charlie", xp: 1050, avatar: "/images/avatar-3.png" },
  { id: 4, name: "David", xp: 980, avatar: "/images/avatar-4.png" },
  { id: 5, name: "Eve", xp: 920, avatar: "/images/avatar-5.png" },
  { id: 6, name: "Frank", xp: 870, avatar: "/images/avatar-6.png" },
  { id: 7, name: "Grace", xp: 810, avatar: "/images/avatar-7.png" },
  { id: 8, name: "Heidi", xp: 750, avatar: "/images/avatar-8.png" },
  { id: 9, name: "Ivan", xp: 700, avatar: "/images/avatar-9.png" },
  { id: 10, name: "Judy", xp: 650, avatar: "/images/avatar-10.png" },
];

export type LeaderboardWidgetProps = {
  className?: string;
  title?: string;
  ariaLabel?: string;
};

export default function LeaderboardWidget({
  className = "",
  title = "Classifica Cittadini",
  ariaLabel = "Classifica Utenti per Punti XP",
}: LeaderboardWidgetProps) {
  const [visibleUsers, setVisibleUsers] = useState<number[]>([]);

  useEffect(() => {
    const timeouts = mockUsers.map((user, index) => {
      return setTimeout(() => {
        setVisibleUsers((prev) => [...prev, user.id]);
      }, index * 100);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <CustomShapeWidget className={className} ariaLabel={ariaLabel}>
      <div className="flex flex-col h-full">
        <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">{title}</h3>
        <div className="relative flex-grow overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto pr-2">
            {mockUsers.map((user, index) => {
              const isFirst = index === 0;
              const isVisible = visibleUsers.includes(user.id);
              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between py-1.5 md:py-2 border-b border-white/10 last:border-b-0 transition-all duration-500 rounded-md px-1 ${
                    isFirst
                      ? "bg-yellow-500/10 scale-[1.02] shadow-lg shadow-yellow-500/10"
                      : "hover:bg-white/5 hover:scale-[1.01]"
                  } ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <div className="flex items-center overflow-hidden">
                    <span
                      className={`text-xs md:text-sm mr-2 md:mr-3 w-6 text-center font-bold ${
                        isFirst ? "text-yellow-400" : "text-white/70"
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full mr-2 md:mr-3 object-cover border-2 border-white/20"
                    />
                    <span
                      className={`font-medium truncate ${
                        isFirst
                          ? "text-white text-base md:text-lg"
                          : "text-white text-sm md:text-base"
                      }`}
                    >
                      {user.name}
                    </span>
                    {isFirst && (
                      <span className="ml-2 text-lg md:text-xl text-yellow-400 animate-pulse">
                        👑
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs md:text-sm font-semibold flex-shrink-0 ${
                      isFirst ? "text-yellow-300 md:text-base" : "text-accent"
                    }`}
                  >
                    {user.xp} XP
                  </span>
                </div>
              );
            })}
          </div>
          {/* Gradient overlays for scroll effect */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </CustomShapeWidget>
  );
}
