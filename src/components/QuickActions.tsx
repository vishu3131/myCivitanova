'use client';

import { Flag, Calendar, Wrench, LineChart } from 'lucide-react';

export const QuickActions = () => {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-heading font-bold mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Flag,
              title: 'Report a Problem',
              description: 'Submit issues or suggestions',
              color: 'text-red-500',
            },
            {
              icon: Calendar,
              title: "Today's Events",
              description: 'See what\'s happening',
              color: 'text-blue-500',
            },
            {
              icon: Wrench,
              title: 'Services',
              description: 'Access city services',
              color: 'text-green-500',
            },
            {
              icon: LineChart,
              title: 'Dashboard',
              description: 'View city metrics',
              color: 'text-purple-500',
            },
          ].map(({ icon: Icon, title, description, color }) => (
            <button
              key={title}
              className="flex flex-col items-start p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
            >
              <Icon className={`w-8 h-8 ${color} mb-4`} />
              <h3 className="text-lg font-heading font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
