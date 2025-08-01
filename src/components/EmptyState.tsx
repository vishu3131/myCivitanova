"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-6"
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Icon className="w-10 h-10 text-white/60" />
      </div>
      
      <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-accent text-black rounded-2xl font-bold text-sm hover:scale-105 transition-transform duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}