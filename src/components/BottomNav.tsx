'use client';

import { Home, Compass, Calendar, Trophy, User } from 'lucide-react';
import Link from 'next/link';

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-gray-200 md:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {[
          { icon: Home, label: 'Home', href: '/' },
          { icon: Compass, label: 'Explore', href: '/explore' },
          { icon: Calendar, label: 'Events', href: '/events' },
          { icon: Trophy, label: 'Classifica', href: '/classifica' },
          { icon: User, label: 'Profile', href: '/profile' },
        ].map(({ icon: Icon, label, href }) => (
          <Link
            key={label}
            href={href}
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50"
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs text-gray-500">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
