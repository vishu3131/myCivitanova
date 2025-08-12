"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  ShieldCheck, 
  ShieldX,
  Mail,
  Calendar,
  Activity,
  Ban,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'moderator' | 'admin' | 'staff';
  status: 'active' | 'suspended' | 'banned';
  created_at: string;
  last_sign_in_at?: string;
  total_xp: number;
  current_level: number;
  badges_count: number;
}

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
}

export function UserManagement({ isOpen, onClose, currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'moderator' | 'admin' | 'staff'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          role,
          status,
          created_at,
          last_sign_in_at,
          total_xp,
          current_level,
          badges_count
        `);

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Errore nel caricamento degli utenti:', error);
      // Fallback con dati demo
      setUsers([
        {
          id: '1',
          email: 'admin@civitanova.it',
          full_name: 'Admin Civitanova',
          role: 'admin',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          last_sign_in_at: '2024-01-15T10:30:00Z',
          total_xp: 5000,
          current_level: 15,
          badges_count: 25
        },
        {
          id: '2',
          email: 'moderator@civitanova.it',
          full_name: 'Moderatore Test',
          role: 'moderator',
          status: 'active',
          created_at: '2024-01-02T00:00:00Z',
          last_sign_in_at: '2024-01-15T09:15:00Z',
          total_xp: 3200,
          current_level: 12,
          badges_count: 18
        },
        {
          id: '3',
          email: 'user@example.com',
          full_name: 'Utente Demo',
          role: 'user',
          status: 'active',
          created_at: '2024-01-03T00:00:00Z',
          last_sign_in_at: '2024-01-14T18:45:00Z',
          total_xp: 1500,
          current_level: 8,
          badges_count: 12
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadUsers();
    }
  }, [isOpen, currentUser, loadUsers]);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole as any } : user
      ));
    } catch (error) {
      console.error('Errore nell\'aggiornamento del ruolo:', error);
      alert('Errore nell\'aggiornamento del ruolo');
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus as any } : user
      ));
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello status:', error);
      alert('Errore nell\'aggiornamento dello status');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente? Questa azione è irreversibile.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'utente:', error);
      alert('Errore nell\'eliminazione dell\'utente');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'moderator': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'staff': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10';
      case 'suspended': return 'text-yellow-400 bg-yellow-500/10';
      case 'banned': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      case 'banned': return <Ban className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  // Verifica permessi
  const hasPermission = currentUser && ['admin'].includes(currentUser.role);

  if (!isOpen) return null;

  if (!hasPermission) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Accesso Negato</h2>
          <p className="text-gray-400 mb-6">Solo gli amministratori possono accedere alla gestione utenti</p>
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
              <Users className="w-6 h-6" />
              Gestione Utenti
            </h2>
            <p className="text-gray-400">Gestisci utenti, ruoli e permessi</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Totale Utenti</span>
              </div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Attivi</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">Admin</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">Moderatori</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'moderator').length}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca utenti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Filters */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tutti i ruoli</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderatori</option>
                <option value="staff">Staff</option>
                <option value="user">Utenti</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tutti gli stati</option>
                <option value="active">Attivi</option>
                <option value="suspended">Sospesi</option>
                <option value="banned">Bannati</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-2 text-white">Caricamento...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onUpdateRole={updateUserRole}
                  onUpdateStatus={updateUserStatus}
                  onDelete={deleteUser}
                  onViewDetails={() => {
                    setSelectedUser(user);
                    setShowUserModal(true);
                  }}
                />
              ))}
              
              {users.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p>Nessun utente trovato</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => {
              setShowUserModal(false);
              setSelectedUser(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente per la card dell'utente
function UserCard({ 
  user, 
  onUpdateRole, 
  onUpdateStatus, 
  onDelete, 
  onViewDetails 
}: { 
  user: User;
  onUpdateRole: (id: string, role: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'moderator': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'staff': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10';
      case 'suspended': return 'text-yellow-400 bg-yellow-500/10';
      case 'banned': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold">
                {user.full_name || user.email}
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getRoleColor(user.role)}`}>
                {user.role.toUpperCase()}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(user.status)}`}>
                {user.status.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {user.email}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Livello {user.current_level} • {user.total_xp} XP
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-white" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 min-w-48">
              <button
                onClick={() => {
                  onViewDetails();
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Visualizza Dettagli
              </button>
              
              <div className="border-t border-gray-700">
                <div className="px-4 py-2 text-xs text-gray-400 font-medium">Cambia Ruolo</div>
                {['user', 'staff', 'moderator', 'admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      onUpdateRole(user.id, role);
                      setShowActions(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-white hover:bg-gray-700 ${
                      user.role === role ? 'bg-gray-700' : ''
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-700">
                <div className="px-4 py-2 text-xs text-gray-400 font-medium">Cambia Status</div>
                {['active', 'suspended', 'banned'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      onUpdateStatus(user.id, status);
                      setShowActions(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-white hover:bg-gray-700 ${
                      user.status === status ? 'bg-gray-700' : ''
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-700">
                <button
                  onClick={() => {
                    onDelete(user.id);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Elimina Utente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 

// Modal per i dettagli dell'utente
function UserDetailsModal({ user: initialUser, onClose }: { user: User; onClose: () => void }) {
  const [user, setUser] = useState(initialUser);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: user.full_name,
          role: user.role,
          status: user.status
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Utente aggiornato con successo!');
      onClose();
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'utente:', error);
      alert('Errore nell\'aggiornamento dell\'utente');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Modifica Utente</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Nome Completo</label>
              <input
                type="text"
                name="full_name"
                value={user.full_name || ''}
                onChange={handleChange}
                className="mt-1 p-2 w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Email</label>
              <input
                type="email"
                name="email"
                value={user.email}
                className="mt-1 p-2 w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Ruolo</label>
              <select
                name="role"
                value={user.role}
                onChange={handleChange}
                className="mt-1 p-2 w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
              >
                <option value="user">Utente</option>
                <option value="moderator">Moderatore</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Stato</label>
              <select
                name="status"
                value={user.status}
                onChange={handleChange}
                className="mt-1 p-2 w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
              >
                <option value="active">Attivo</option>
                <option value="suspended">Sospeso</option>
                <option value="banned">Bannato</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-gray-400 hover:text-gray-200 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-md text-white font-medium ${isSaving ? 'bg-blue-700 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 transition-colors'
              }`}
          >
            {isSaving ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}