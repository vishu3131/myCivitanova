"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Plus, 
  Edit3, 
  Trash2, 
  X,
  Save,
  Search,
  Filter,
  BarChart3,
  Users,
  TrendingUp,
  Gift
} from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { Mission } from '@/types/gamification';

interface Badge {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  requirement_type: 'xp' | 'level' | 'activity' | 'streak';
  requirement_value: number;
  is_active: boolean;
  created_at: string;
  earned_count: number;
}

interface XPActivity {
  id: string;
  activity_type: string;
  display_name: string;
  xp_amount: number;
  description: string;
  is_active: boolean;
  daily_limit?: number;
  created_at: string;
}

interface GamificationStats {
  total_badges: number;
  active_badges: number;
  total_xp_activities: number;
  total_xp_distributed: number;
  active_users_with_xp: number;
  average_user_level: number;
}

interface GamificationManagementProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
}

export function GamificationManagement({ isOpen, onClose, currentUser }: GamificationManagementProps) {
  const [activeTab, setActiveTab] = useState<'badges' | 'xp' | 'missions' | 'stats'>('badges');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [xpActivities, setXpActivities] = useState<XPActivity[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateBadge, setShowCreateBadge] = useState(false);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [showCreateMission, setShowCreateMission] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [editingActivity, setEditingActivity] = useState<XPActivity | null>(null);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadData();
    }
  }, [isOpen, currentUser]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadBadges(),
      loadXPActivities(),
      loadMissions(),
      loadStats()
    ]);
    setLoading(false);
  };

  const loadBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select(`
          *,
          earned_count:user_badges(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Errore nel caricamento dei badge:', error);
      // Fallback con dati demo
      setBadges([
        {
          id: '1',
          name: 'welcome',
          title: 'Benvenuto',
          description: 'Primo accesso all\'app',
          icon: '👋',
          color: '#3B82F6',
          requirement_type: 'activity',
          requirement_value: 1,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          earned_count: 150
        },
        {
          id: '2',
          name: 'explorer',
          title: 'Esploratore',
          description: 'Visita 5 luoghi diversi',
          icon: '🗺️',
          color: '#10B981',
          requirement_type: 'activity',
          requirement_value: 5,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          earned_count: 89
        },
        {
          id: '3',
          name: 'level_master',
          title: 'Maestro',
          description: 'Raggiungi il livello 10',
          icon: '🏆',
          color: '#F59E0B',
          requirement_type: 'level',
          requirement_value: 10,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          earned_count: 45
        }
      ]);
    }
  };

  const loadXPActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('xp_activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setXpActivities(data || []);
    } catch (error) {
      console.error('Errore nel caricamento delle attività XP:', error);
      // Fallback con dati demo
      setXpActivities([
        {
          id: '1',
          activity_type: 'daily_login',
          display_name: 'Login Giornaliero',
          xp_amount: 10,
          description: 'XP per il login giornaliero',
          is_active: true,
          daily_limit: 1,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          activity_type: 'location_visit',
          display_name: 'Visita Luogo',
          xp_amount: 25,
          description: 'XP per visitare un nuovo luogo',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          activity_type: 'event_participation',
          display_name: 'Partecipazione Evento',
          xp_amount: 50,
          description: 'XP per partecipare a un evento',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      ]);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_gamification_stats');
      if (error) throw error;
      setStats(data?.[0] || null);
    } catch (error) {
      console.error('Errore nel caricamento delle statistiche:', error);
      // Fallback con dati demo
      setStats({
        total_badges: 15,
        active_badges: 12,
        total_xp_activities: 8,
        total_xp_distributed: 125000,
        active_users_with_xp: 284,
        average_user_level: 6.8
      });
    }
  };

  const createBadge = async (badgeData: Partial<Badge>) => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .insert([badgeData])
        .select()
        .single();

      if (error) throw error;
      setBadges(prev => [{ ...data, earned_count: 0 }, ...prev]);
      setShowCreateBadge(false);
    } catch (error) {
      console.error('Errore nella creazione del badge:', error);
      alert('Errore nella creazione del badge');
    }
  };

  const updateBadge = async (badgeData: Partial<Badge>) => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .update(badgeData)
        .eq('id', badgeData.id)
        .select()
        .single();

      if (error) throw error;
      setBadges(prev => prev.map(badge => 
        badge.id === badgeData.id ? { ...badge, ...data } : badge
      ));
      setEditingBadge(null);
    } catch (error) {
      console.error('Errore nell\'aggiornamento del badge:', error);
      alert('Errore nell\'aggiornamento del badge');
    }
  };

  const deleteBadge = async (badgeId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo badge?')) return;

    try {
      const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', badgeId);

      if (error) throw error;
      setBadges(prev => prev.filter(badge => badge.id !== badgeId));
    } catch (error) {
      console.error('Errore nell\'eliminazione del badge:', error);
      alert('Errore nell\'eliminazione del badge');
    }
  };

  const createXPActivity = async (activityData: Partial<XPActivity>) => {
    try {
      const { data, error } = await supabase
        .from('xp_activities')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;
      setXpActivities(prev => [data, ...prev]);
      setShowCreateActivity(false);
    } catch (error) {
      console.error('Errore nella creazione dell\'attività XP:', error);
      alert('Errore nella creazione dell\'attività XP');
    }
  };

  const updateXPActivity = async (activityData: Partial<XPActivity>) => {
    try {
      const { data, error } = await supabase
        .from('xp_activities')
        .update(activityData)
        .eq('id', activityData.id)
        .select()
        .single();

      if (error) throw error;
      setXpActivities(prev => prev.map(activity => 
        activity.id === activityData.id ? { ...activity, ...data } : activity
      ));
      setEditingActivity(null);
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'attività XP:', error);
      alert('Errore nell\'aggiornamento dell\'attività XP');
    }
  };

  const deleteXPActivity = async (activityId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa attività XP?')) return;

    try {
      const { error } = await supabase
        .from('xp_activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;
      setXpActivities(prev => prev.filter(activity => activity.id !== activityId));
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'attività XP:', error);
      alert('Errore nell\'eliminazione dell\'attività XP');
    }
  };

  const handleEditMission = (mission: Mission) => {
    setEditingMission(mission);
    setShowCreateMission(true);
  };

  const handleDeleteMission = async (missionId: string) => {
    if (window.confirm('Are you sure you want to delete this mission?')) {
      try {
        const { error } = await supabase
          .from('missions')
          .delete()
          .eq('id', missionId);

        if (error) throw error;
        loadMissions();
      } catch (error) {
        console.error('Error deleting mission:', error);
        alert('Failed to delete mission.');
      }
    }
  };

  const handleViewMissionDetails = (mission: Mission) => {
    setSelectedMission(mission);
    setShowMissionDetails(true);
  };

  // Verifica permessi
  const hasPermission = currentUser && ['admin', 'moderator'].includes(currentUser.role);

  if (!isOpen) return null;

  if (!hasPermission) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Accesso Negato</h2>
          <p className="text-gray-400 mb-6">Non hai i permessi per accedere alla gestione gamification</p>
          <button 
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg font-medium transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] border border-gray-700 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Gestione Gamification
            </h2>
            <p className="text-gray-400">Gestisci badge, XP e sistema di ricompense</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="p-6 border-b border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">Badge Totali</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.total_badges}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Badge Attivi</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.active_badges}</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">Attività XP</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.total_xp_activities}</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">XP Distribuiti</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.total_xp_distributed.toLocaleString()}</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">Utenti Attivi</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.active_users_with_xp}</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">Livello Medio</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.average_user_level.toFixed(1)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'badges'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Badge
          </button>
          <button
            onClick={() => setActiveTab('xp')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'xp'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Attività XP
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'stats'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Statistiche
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'badges' && (
            <BadgesTab
              badges={badges}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onCreateBadge={() => setShowCreateBadge(true)}
              onEditBadge={setEditingBadge}
              onDeleteBadge={deleteBadge}
            />
          )}

          {activeTab === 'xp' && (
            <XPActivitiesTab
              activities={xpActivities}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onCreateActivity={() => setShowCreateActivity(true)}
              onEditActivity={setEditingActivity}
              onDeleteActivity={deleteXPActivity}
            />
          )}

          {activeTab === 'stats' && (
            <StatsTab stats={stats} />
          )}

          {activeTab === 'missions' && (
            <MissioniTab
              missions={missions}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onCreateMission={() => setShowCreateMission(true)}
              onEditMission={setEditingMission}
              onDeleteMission={deleteMission}
              onViewMissionDetails={handleViewMissionDetails}
            />
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateBadge && (
          <BadgeFormModal
            onSubmit={createBadge}
            onCancel={() => setShowCreateBadge(false)}
          />
        )}
        
        {editingBadge && (
          <BadgeFormModal
            badge={editingBadge}
            onSubmit={updateBadge}
            onCancel={() => setEditingBadge(null)}
          />
        )}

        {showCreateActivity && (
          <XPActivityFormModal
            onSubmit={createXPActivity}
            onCancel={() => setShowCreateActivity(false)}
          />
        )}
        
        {editingActivity && (
          <XPActivityFormModal
            activity={editingActivity}
            onSubmit={updateXPActivity}
            onCancel={() => setEditingActivity(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Tab per i Badge
function BadgesTab({ 
  badges, 
  loading, 
  searchTerm, 
  setSearchTerm, 
  onCreateBadge, 
  onEditBadge, 
  onDeleteBadge 
}: any) {
  const filteredBadges = badges.filter((badge: Badge) =>
    badge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca badge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={onCreateBadge}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuovo Badge
        </button>
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white">Caricamento...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge: Badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              onEdit={() => onEditBadge(badge)}
              onDelete={() => onDeleteBadge(badge.id)}
            />
          ))}
        </div>
      )}

      {filteredBadges.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <p>Nessun badge trovato</p>
        </div>
      )}
    </div>
  );
}

// Tab per le Attività XP
function XPActivitiesTab({ 
  activities, 
  loading, 
  searchTerm, 
  setSearchTerm, 
  onCreateActivity, 
  onEditActivity, 
  onDeleteActivity 
}: any) {
  const filteredActivities = activities.filter((activity: XPActivity) =>
    activity.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca attività..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={onCreateActivity}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuova Attività
        </button>
      </div>

      {/* Activities List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white">Caricamento...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity: XPActivity) => (
            <XPActivityCard
              key={activity.id}
              activity={activity}
              onEdit={() => onEditActivity(activity)}
              onDelete={() => onDeleteActivity(activity.id)}
            />
          ))}
        </div>
      )}

      {filteredActivities.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <p>Nessuna attività trovata</p>
        </div>
      )}
    </div>
  );
}

// Tab per le Statistiche
function StatsTab({ stats }: { stats: GamificationStats | null }) {}

// Tab per le Missioni
function MissioniTab({
  missions,
  loading,
  searchTerm,
  setSearchTerm,
  onCreateMission,
  onEditMission,
  onDeleteMission,
  onViewMissionDetails
}: any) {
  const filteredMissions = missions.filter((mission: Mission) =>
    mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mission.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca missioni..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={onCreateMission}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuova Missione
        </button>
      </div>

      {/* Missions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white">Caricamento...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMissions.map((mission: Mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onEdit={() => onEditMission(mission)}
              onDelete={() => onDeleteMission(mission.id)}
              onViewDetails={() => onViewMissionDetails(mission)}
            />
          ))}
        </div>
      )}

      {filteredMissions.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <p>Nessuna missione trovata</p>
        </div>
      )}
    </div>
  );
}

// Card per Missione
function MissionCard({ mission, onEdit, onDelete, onViewDetails }: { mission: Mission; onEdit: () => void; onDelete: () => void; onViewDetails: () => void }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer" onClick={onViewDetails}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white font-semibold">{mission.title}</h3>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-medium">
              +{mission.xp_reward} XP
            </span>
            <span className={`px-2 py-1 rounded text-xs ${
              mission.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {mission.is_active ? 'Attiva' : 'Inattiva'}
            </span>
          </div>
          
          <p className="text-gray-400 text-sm mb-2">{mission.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {mission.activity_type_required && (
              <span>Richiede: {mission.activity_type_required} ({mission.activity_value_required})</span>
            )}
            {mission.completion_count && (
              <span>Completamenti richiesti: {mission.completion_count}</span>
            )}
            <span>Creato: {new Date(mission.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal per creare/modificare Missione
function MissionFormModal({ mission, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: mission?.name || '',
    title: mission?.title || '',
    description: mission?.description || '',
    xp_reward: mission?.xp_reward || 100,
    is_active: mission?.is_active ?? true,
    activity_type_required: mission?.activity_type_required || '',
    activity_value_required: mission?.activity_value_required || null,
    completion_count: mission?.completion_count || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(mission ? { ...formData, id: mission.id } : formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            {mission ? 'Modifica Missione' : 'Nuova Missione'}
          </h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nome (ID)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Titolo</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Descrizione</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">XP Ricompensa</label>
            <input
              type="number"
              value={formData.xp_reward}
              onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tipo Attività Richiesta (Opzionale)</label>
            <input
              type="text"
              value={formData.activity_type_required || ''}
              onChange={(e) => setFormData({ ...formData, activity_type_required: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., 'daily_login'"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Valore Attività Richiesta (Opzionale)</label>
            <input
              type="number"
              value={formData.activity_value_required || ''}
              onChange={(e) => setFormData({ ...formData, activity_value_required: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              min="1"
              placeholder="e.g., 1 (for 1 login)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Completamenti Richiesti (Opzionale)</label>
            <input
              type="number"
              value={formData.completion_count || ''}
              onChange={(e) => setFormData({ ...formData, completion_count: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              min="1"
              placeholder="e.g., 5 (for 5 times)"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_mission"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active_mission" className="text-sm text-gray-400">Missione attiva</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {mission ? 'Aggiorna' : 'Crea'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Modal per i dettagli della Missione
function MissionDetailsModal({ mission, onEdit, onDelete, onCancel }: any) {
  if (!mission) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Dettagli Missione</h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-white">
          <div>
            <p className="text-gray-400 text-sm">Nome (ID):</p>
            <p className="text-lg font-semibold">{mission.name}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Titolo:</p>
            <p className="text-lg font-semibold">{mission.title}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Descrizione:</p>
            <p>{mission.description}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">XP Ricompensa:</p>
            <p className="text-lg font-semibold">{mission.xp_reward}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Stato:</p>
            <p className={`font-semibold ${mission.is_active ? 'text-green-400' : 'text-gray-400'}`}>
              {mission.is_active ? 'Attiva' : 'Inattiva'}
            </p>
          </div>
          {mission.activity_type_required && (
            <div>
              <p className="text-gray-400 text-sm">Tipo Attività Richiesta:</p>
              <p>{mission.activity_type_required}</p>
            </div>
          )}
          {mission.activity_value_required && (
            <div>
              <p className="text-gray-400 text-sm">Valore Attività Richiesta:</p>
              <p>{mission.activity_value_required}</p>
            </div>
          )}
          {mission.completion_count && (
            <div>
              <p className="text-gray-400 text-sm">Completamenti Richiesti:</p>
              <p>{mission.completion_count}</p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-sm">Data Creazione:</p>
            <p>{new Date(mission.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Modifica
          </button>
          <button
            onClick={onDelete}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Elimina
          </button>
        </div>
      </motion.div>
    </div>
  );
}
  if (!stats) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>Statistiche non disponibili</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Badge Stats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Statistiche Badge
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Badge Totali</span>
              <span className="text-white font-semibold">{stats.total_badges}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Badge Attivi</span>
              <span className="text-white font-semibold">{stats.active_badges}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tasso di Attivazione</span>
              <span className="text-white font-semibold">
                {((stats.active_badges / stats.total_badges) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* XP Stats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Statistiche XP
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">XP Totali Distribuiti</span>
              <span className="text-white font-semibold">{stats.total_xp_distributed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Utenti con XP</span>
              <span className="text-white font-semibold">{stats.active_users_with_xp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Livello Medio</span>
              <span className="text-white font-semibold">{stats.average_user_level.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Statistiche Attività
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Attività XP Totali</span>
              <span className="text-white font-semibold">{stats.total_xp_activities}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">XP Medi per Utente</span>
              <span className="text-white font-semibold">
                {Math.round(stats.total_xp_distributed / stats.active_users_with_xp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Engagement
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Utenti Attivi</span>
              <span className="text-white font-semibold">{stats.active_users_with_xp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Partecipazione Media</span>
              <span className="text-white font-semibold">
                {((stats.active_users_with_xp / (stats.active_users_with_xp + 50)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Card per Badge
function BadgeCard({ badge, onEdit, onDelete }: { badge: Badge; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: badge.color + '20', border: `2px solid ${badge.color}` }}
          >
            {badge.icon}
          </div>
          <div>
            <h3 className="text-white font-semibold">{badge.title}</h3>
            <p className="text-gray-400 text-sm">{badge.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-gray-400">
            {badge.requirement_type}: {badge.requirement_value}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            badge.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
            {badge.is_active ? 'Attivo' : 'Inattivo'}
          </span>
        </div>
        <span className="text-blue-400 font-medium">
          {badge.earned_count} ottenuti
        </span>
      </div>
    </div>
  );
}

// Card per Attività XP
function XPActivityCard({ activity, onEdit, onDelete }: { activity: XPActivity; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white font-semibold">{activity.display_name}</h3>
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-medium">
              +{activity.xp_amount} XP
            </span>
            <span className={`px-2 py-1 rounded text-xs ${
              activity.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {activity.is_active ? 'Attivo' : 'Inattivo'}
            </span>
          </div>
          
          <p className="text-gray-400 text-sm mb-2">{activity.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Tipo: {activity.activity_type}</span>
            {activity.daily_limit && (
              <span>Limite giornaliero: {activity.daily_limit}</span>
            )}
            <span>Creato: {new Date(activity.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal per creare/modificare Badge
function BadgeFormModal({ badge, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: badge?.name || '',
    title: badge?.title || '',
    description: badge?.description || '',
    icon: badge?.icon || '🏆',
    color: badge?.color || '#3B82F6',
    requirement_type: badge?.requirement_type || 'xp',
    requirement_value: badge?.requirement_value || 100,
    is_active: badge?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(badge ? { ...formData, id: badge.id } : formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            {badge ? 'Modifica Badge' : 'Nuovo Badge'}
          </h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nome (ID)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Titolo</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Descrizione</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Icona</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="🏆"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Colore</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 bg-gray-800 border border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Tipo Requisito</label>
              <select
                value={formData.requirement_type}
                onChange={(e) => setFormData({ ...formData, requirement_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="xp">XP</option>
                <option value="level">Livello</option>
                <option value="activity">Attività</option>
                <option value="streak">Streak</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Valore Requisito</label>
              <input
                type="number"
                value={formData.requirement_value}
                onChange={(e) => setFormData({ ...formData, requirement_value: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-400">Badge attivo</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {badge ? 'Aggiorna' : 'Crea'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Modal per creare/modificare Attività XP
function XPActivityFormModal({ activity, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    activity_type: activity?.activity_type || '',
    display_name: activity?.display_name || '',
    xp_amount: activity?.xp_amount || 10,
    description: activity?.description || '',
    is_active: activity?.is_active ?? true,
    daily_limit: activity?.daily_limit || null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(activity ? { ...formData, id: activity.id } : formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            {activity ? 'Modifica Attività' : 'Nuova Attività XP'}
          </h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tipo Attività</label>
            <input
              type="text"
              value={formData.activity_type}
              onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="daily_login"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nome Visualizzato</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Descrizione</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">XP Assegnati</label>
              <input
                type="number"
                value={formData.xp_amount}
                onChange={(e) => setFormData({ ...formData, xp_amount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Limite Giornaliero</label>
              <input
                type="number"
                value={formData.daily_limit || ''}
                onChange={(e) => setFormData({ ...formData, daily_limit: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                min="1"
                placeholder="Nessun limite"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_activity"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active_activity" className="text-sm text-gray-400">Attività attiva</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {activity ? 'Aggiorna' : 'Crea'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}