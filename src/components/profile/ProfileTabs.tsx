// Componente Tabs del profilo

import React from 'react';
import { motion } from 'framer-motion';
import { User, BarChart3, Award, Settings } from 'lucide-react';

type TabType = 'overview' | 'stats' | 'badges' | 'settings';

interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const tabs: TabConfig[] = [
  {
    id: 'overview',
    label: 'Panoramica',
    icon: User,
    description: 'Informazioni generali e attività recenti'
  },
  {
    id: 'stats',
    label: 'Statistiche',
    icon: BarChart3,
    description: 'Statistiche dettagliate e progressi'
  },
  {
    id: 'badges',
    label: 'Badge',
    icon: Award,
    description: 'Tutti i badge ottenuti'
  },
  {
    id: 'settings',
    label: 'Impostazioni',
    icon: Settings,
    description: 'Impostazioni profilo e privacy'
  }
];

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <div className="relative mb-8">
      {/* Desktop Tabs */}
      <div className="hidden sm:block">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 group ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center gap-3">
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`} />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                    {tab.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="sm:hidden">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1">
          <div className="grid grid-cols-2 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeMobileTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${
                      isActive ? 'scale-110' : ''
                    }`} />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Tab Indicator Line (Desktop only) */}
      <div className="hidden sm:block absolute -bottom-4 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
};

export default ProfileTabs;