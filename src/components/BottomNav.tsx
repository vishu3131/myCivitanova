'use client';

import { Home, Compass, Calendar, Flag, User } from 'lucide-react';

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-gray-200 md:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {[
          { icon: Home, label: 'Home' },
          { icon: Compass, label: 'Explore' },
          { icon: Calendar, label: 'Events' },
          { icon: Flag, label: 'Report' },
          { icon: User, label: 'Profile' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50"
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs text-gray-500">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
