"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Trophy,
  Zap,
  Star,
  Award,
  Target,
  Calendar,
  Clock,
  Users,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  ChevronRight,
  Flame,
  Crown,
  Medal,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { useCallback } from 'react';

interface UserStats {
  total_xp: number;
  current_level: number;
  level_progress: number;
  level_title: string;
  badges_count: number;
  xp_to_next_level: number;
  weekly_xp: number;
  monthly_xp: number;
  daily_streak: number;
  total_activities: number;
  rank_position: number;
  achievements_unlocked: number;
}

interface XPActivity {
  id: string;
  activity_type: string;
  xp_earned: number;
  created_at: string;
  description?: string;
}

interface XPHistoryData {
  date_period: string;
  daily_xp: number;
  activity_count: number;
  cumulative_xp: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at: string;
}

interface FuturisticUserStatsProps {
  userId: string;
  isVisible: boolean;
}

export function FuturisticUserStats({ userId, isVisible }: FuturisticUserStatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<XPActivity[]>([]);
  const [recentBadges, setRecentBadges] = useState<Badge[]>([]);
  const [xpHistory, setXpHistory] = useState<XPHistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'xp' | 'activities' | 'progress'>('xp');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  // Load XP history based on time range
  const loadXPHistory = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: historyData, error } = await supabase
        .rpc('get_xp_history', { 
          user_id: userId, 
          time_range: timeRange 
        });

      if (error) throw error;

      if (historyData) {
        setXpHistory(historyData);
      }
    } catch (error) {
      console.error('Error loading XP history:', error);
      // Fallback to empty array if function doesn't exist yet
      setXpHistory([]);
    }
  }, [userId, timeRange]);

  // Load user statistics
  const loadUserStats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Get user stats using RPC function
      const { data: userStats, error: statsError } = await supabase
        .rpc('get_user_stats', { user_uuid: userId });

      if (statsError) throw statsError;

      if (userStats) {
        setStats(userStats as any);
      }

      // Get recent XP activities
      const { data: activities, error: activitiesError } = await supabase
        .from('xp_transactions')
        .select('id, activity_type, xp_amount as xp_earned, created_at, description')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!activitiesError && activities) {
        setRecentActivities(activities);
      }

      // Get recent badges
      const { data: badges, error: badgesError } = await supabase
        .rpc('get_user_badges', { user_uuid: userId })
        .limit(5);

      if (!badgesError && badges) {
        setRecentBadges(badges);
      }

      // Get XP history data
      await loadXPHistory();

    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, loadXPHistory]);

  // Reload XP history when time range changes
  useEffect(() => {
    if (userId && isVisible) {
      loadXPHistory();
    }
  }, [userId, isVisible, loadXPHistory]);

  useEffect(() => {
    if (isVisible && userId) {
      loadUserStats();
    }
  }, [isVisible, userId, loadUserStats]);

  // Generate chart data based on time range and active chart
  const generateChartData = () => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    
    // Use real XP history data if available
    if (xpHistory.length > 0) {
      return xpHistory.map((item, index) => ({
        day: index + 1,
        date: item.date_period,
        xp: item.daily_xp,
        activities: item.activity_count,
        cumulative_xp: item.cumulative_xp
      }));
    }
    
    // Show empty data (all zeros) when no historical data is available
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      xp: 0,
      activities: 0,
      cumulative_xp: 0
    }));
  };

  const chartData = generateChartData();

  // Rarity colors
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'XP Totale',
                value: stats?.total_xp?.toLocaleString() || '0',
                icon: Zap,
                color: 'from-yellow-400 to-orange-500',
                change: '+12%'
              },
              {
                label: 'Livello',
                value: stats?.current_level || '1',
                icon: Trophy,
                color: 'from-blue-400 to-purple-500',
                subtitle: stats?.level_title || 'Novizio'
              },
              {
                label: 'Badge',
                value: stats?.badges_count || '0',
                icon: Award,
                color: 'from-green-400 to-cyan-500',
                change: '+2'
              },
              {
                label: 'Streak',
                value: `${stats?.daily_streak || 0}d`,
                icon: Flame,
                color: 'from-red-400 to-pink-500',
                subtitle: 'Giorni consecutivi'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  {stat.change && (
                    <span className="text-xs text-green-400 font-medium">
                      {stat.change}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.subtitle || stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Level Progress */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Progresso Livello</h3>
                  <p className="text-gray-400 text-sm">
                    {stats.xp_to_next_level} XP al prossimo livello
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    Lv. {stats.current_level}
                  </div>
                  <div className="text-sm text-cyan-400">
                    {stats.level_title}
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.level_progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full relative"
                  >
                    <motion.div
                      animate={{ x: [-10, 10, -10] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-white/20 rounded-full"
                    />
                  </motion.div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-400">
                  <span>Lv. {stats.current_level}</span>
                  <span>{stats.level_progress.toFixed(1)}%</span>
                  <span>Lv. {stats.current_level + 1}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Statistiche Dettagliate</h3>
              
              {/* Time Range Selector */}
              <div className="flex gap-2 bg-white/5 rounded-xl p-1">
                {[
                  { id: 'week', label: '7G' },
                  { id: 'month', label: '30G' },
                  { id: 'year', label: '1A' }
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setTimeRange(range.id as any)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      timeRange === range.id
                        ? 'bg-cyan-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Type Selector */}
            <div className="flex gap-2 mb-6">
              {[
                { id: 'xp', label: 'XP Guadagnati', icon: Zap },
                { id: 'activities', label: 'Attività', icon: Activity },
                { id: 'progress', label: 'Progresso', icon: TrendingUp }
              ].map((chart) => {
                const Icon = chart.icon;
                return (
                  <button
                    key={chart.id}
                    onClick={() => setActiveChart(chart.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      activeChart === chart.id
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{chart.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Chart Visualization */}
            <div className="h-48 flex items-end justify-between gap-1">
              {chartData.slice(0, timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 52).map((data, index) => {
                const maxValue = Math.max(...chartData.map(d => activeChart === 'xp' ? d.xp : d.activities));
                const height = activeChart === 'xp' 
                  ? Math.max((data.xp / (maxValue || 1)) * 100, 2)
                  : Math.max((data.activities / (maxValue || 1)) * 100, 2);
                
                const displayDate = data.date ? new Date(data.date).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: '2-digit'
                }) : `Giorno ${data.day}`;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.02 }}
                    className="flex-1 bg-gradient-to-t from-cyan-500/50 to-purple-500/50 rounded-t-sm min-h-[4px] hover:from-cyan-400 hover:to-purple-400 transition-all cursor-pointer relative group"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      <div className="font-medium">{displayDate}</div>
                      <div className="text-cyan-400">
                        {activeChart === 'xp' ? `${data.xp} XP` : `${data.activities} attività`}
                      </div>
                      {xpHistory.length > 0 && (
                        <div className="text-gray-400 text-xs">
                          Tot: {data.cumulative_xp || 0} XP
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Chart Legend */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded"></div>
                  <span>{activeChart === 'xp' ? 'XP Giornalieri' : 'Attività Giornaliere'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">
                  Totale: {xpHistory.length > 0 
                    ? xpHistory.reduce((sum, item) => sum + (activeChart === 'xp' ? item.daily_xp : item.activity_count), 0)
                    : 0
                  }
                  {activeChart === 'xp' ? ' XP' : ' attività'}
                </div>
                <div className="text-xs">
                  Media: {xpHistory.length > 0 
                    ? Math.round(xpHistory.reduce((sum, item) => sum + (activeChart === 'xp' ? item.daily_xp : item.activity_count), 0) / xpHistory.length)
                    : 0
                  }
                  {activeChart === 'xp' ? ' XP/giorno' : ' att/giorno'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Attività Recenti
            </h3>
            
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Zap className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white capitalize">
                          {activity.activity_type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(activity.created_at).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                    </div>
                    <div className="text-cyan-400 font-semibold">
                      +{activity.xp_earned} XP
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nessuna attività recente</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Badges */}
          {recentBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Badge Recenti
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border border-white/10 bg-gradient-to-br ${getRarityColor(badge.rarity)} bg-opacity-20`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <div className="font-semibold text-white text-sm mb-1">
                        {badge.name}
                      </div>
                      <div className="text-xs text-gray-300 mb-2">
                        {badge.description}
                      </div>
                      <div className={`text-xs font-medium capitalize px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(badge.rarity)}`}>
                        {badge.rarity}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}