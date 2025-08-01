import React from 'react';

export interface BadgeListProps {
  badges: Array<{ badge_name: string; date_unlocked: string }>;
}

export const BadgeList: React.FC<BadgeListProps> = ({ badges }) => {
  if (!badges.length) return <div className="text-gray-400 text-center">Nessun badge sbloccato</div>;
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {badges.map((badge, idx) => (
        <div key={idx} className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white px-3 py-1 rounded-full shadow-lg animate-pulse">
          <span className="mr-2">{badge.badge_name}</span>
          <span className="text-xs">{new Date(badge.date_unlocked).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
};
