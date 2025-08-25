'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { DatabaseService } from '@/lib/database.ts';
import { useAuthWithRole } from "@/hooks/useAuthWithRole";
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck, 
  Crown,
  Star,
  AlertCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'moderator' | 'admin' | 'staff';
  bio?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  is_active: boolean;
  is_verified: boolean;
  privacy_settings: {
    profile_public: boolean;
    email_public: boolean;
    phone_public: boolean;
  };
  notification_settings: {
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
  };
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const { user: currentUser, role, loading: authLoading } = useAuthWithRole();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<User['role']>('user');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Number of users per page
  const [totalUsersCount, setTotalUsersCount] = useState(0); // Total count of users
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch total count first (if needed for pagination UI)
      const { count } = await DatabaseService.getUsersCount();
      setTotalUsersCount(count || 0);

      const offset = (currentPage - 1) * usersPerPage;
      const usersData = await DatabaseService.getUsers({
        limit: usersPerPage,
        offset: offset,
        role: selectedRole === 'all' ? undefined : (selectedRole as User['role']),
      });
      setUsers(usersData);
    } catch (error) {
      console.error('Errore caricamento utenti:', error);
      setUsers([]); // Clear users on error
    } finally {
      setLoading(false);
    }
  }, [currentPage, usersPerPage, selectedRole]);

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser, loadUsers]);

  // Auto-refresh users list every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !currentUser) return;

    const interval = setInterval(() => {
      loadUsers();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, currentUser, loadUsers]);

  const handleEditClick = (user: User) => {
    if (role !== 'admin') {
      setEditError('Solo gli amministratori possono modificare i ruoli.');
      return;
    }
    setUserToEdit(user);
    setNewRole(user.role);
    setEditError('');
    setEditSuccess('');
    setIsEditModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!userToEdit || role !== 'admin') {
      setEditError('Operazione non autorizzata.');
      return;
    }

    if (userToEdit.id === currentUser?.id && newRole !== 'admin') {
      setEditError('Non puoi declassare il tuo ruolo di amministratore.');
      return;
    }

    setLoading(true);
    try {
      await DatabaseService.updateUserRole(userToEdit.id, newRole);
      setEditSuccess('Ruolo utente aggiornato con successo!');
      loadUsers(); // Refresh the list
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Errore aggiornamento ruolo:', error);
      setEditError('Errore durante l\'aggiornamento del ruolo.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    const matchesVerification = verificationFilter === 'all' || 
                               (verificationFilter === 'verified' && user.is_verified) ||
                               (verificationFilter === 'unverified' && !user.is_verified);
    
    const now = new Date();
    const userDate = new Date(user.created_at);
    const matchesDate = dateFilter === 'all' ||
                       (dateFilter === 'today' && userDate.toDateString() === now.toDateString()) ||
                       (dateFilter === 'week' && (now.getTime() - userDate.getTime()) <= 7 * 24 * 60 * 60 * 1000) ||
                       (dateFilter === 'month' && (now.getTime() - userDate.getTime()) <= 30 * 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesRole && matchesVerification && matchesDate;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'staff': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'staff': return <Shield className="w-4 h-4" />;
      case 'moderator': return <Star className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const totalPages = Math.ceil(totalUsersCount / usersPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Caricamento utenti...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!currentUser || !['admin', 'moderator'].includes(role)) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Accesso Negato</h2>
          <p className="text-gray-500 dark:text-gray-400">Non hai i permessi per accedere a questa sezione</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestione Utenti
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestisci gli utenti registrati e i loro permessi
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredUsers.length} di {totalUsersCount} utenti
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalUsersCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Totali</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => u.is_active).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Attivi</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Shield className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => u.is_verified).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Verificati</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Crown className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => ['admin', 'staff', 'moderator'].includes(u.role)).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Staff</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Star className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => {
                    const today = new Date();
                    const userDate = new Date(u.created_at);
                    return userDate.toDateString() === today.toDateString();
                  }).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Oggi</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => {
                    const now = new Date();
                    const userDate = new Date(u.created_at);
                    return (now.getTime() - userDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
                  }).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Settimana</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-4">
            {/* First Row - Search and Auto Refresh */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cerca utenti per nome o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Auto Refresh Toggle */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Aggiornamento automatico</span>
                </label>
              </div>
            </div>

            {/* Second Row - Advanced Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Role Filter */}
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ruolo</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tutti i ruoli</option>
                  <option value="user">Utenti</option>
                  <option value="moderator">Moderatori</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Amministratori</option>
                </select>
              </div>

              {/* Verification Filter */}
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verifica</label>
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="verified">Verificati</option>
                  <option value="unverified">Non verificati</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registrazione</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tutte le date</option>
                  <option value="today">Oggi</option>
                  <option value="week">Ultima settimana</option>
                  <option value="month">Ultimo mese</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Utente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contatti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ruolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Registrato
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.full_name || 'Nome non disponibile'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                          {user.date_of_birth && (
                            <div className="text-xs text-gray-400">
                              Nato il {new Date(user.date_of_birth).toLocaleDateString('it-IT')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.phone && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">📞</span>
                            {user.phone}
                          </div>
                        )}
                        {user.address && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500">📍</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                              {user.address}
                            </span>
                          </div>
                        )}
                        {!user.phone && !user.address && (
                          <span className="text-xs text-gray-400">Non disponibile</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {user.is_active ? 'Attivo' : 'Inattivo'}
                        </span>
                        {user.is_verified && (
                          <UserCheck className="w-4 h-4 text-green-500" />
                        )}
                        {!user.is_verified && (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifica ruolo"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Precedente
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              Pagina {currentPage} di {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Successiva
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nessun utente trovato
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Prova a modificare i filtri di ricerca
            </p>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {isEditModalOpen && userToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Modifica Ruolo Utente</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Modifica il ruolo per <span className="font-semibold">{userToEdit.full_name || userToEdit.email}</span>.
            </p>

            <div className="mb-4">
              <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seleziona Nuovo Ruolo
              </label>
              <select
                id="user-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as User['role'])}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">Utente</option>
                <option value="moderator">Moderatore</option>
                <option value="staff">Staff</option>
                <option value="admin">Amministratore</option>
              </select>
            </div>

            {editError && <div className="text-red-500 text-sm mb-4">{editError}</div>}
            {editSuccess && <div className="text-green-500 text-sm mb-4">{editSuccess}</div>}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveRole}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || (userToEdit.role === newRole)}
              >
                {loading ? 'Salvataggio...' : 'Salva Ruolo'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
