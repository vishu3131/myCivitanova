'use client';

import {
  LayoutDashboard,
  Users,
  FileText,
  Trophy,
  LineChart,
  Settings
} from 'lucide-react';

export const AdminSidebar = () => {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 hidden lg:block">
      <nav className="p-4">
        <ul className="space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard' },
            { icon: Users, label: 'Users' },
            { icon: FileText, label: 'Content' },
            { icon: Trophy, label: 'Gamification', href: '/admin/gamification' },
            { icon: LineChart, label: 'Analytics' },
            { icon: Settings, label: 'Settings' },
          ].map(({ icon: Icon, label, href }) => (
            <li key={label}>
              <a
                href={href || '#'}
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Icon className="w-6 h-6 mr-3" />
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
