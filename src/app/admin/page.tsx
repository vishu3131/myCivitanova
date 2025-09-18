"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuthWithRole } from "@/hooks/useAuthWithRole";
import { useCache, CACHE_KEYS } from '@/lib/cache';
import { OptimizedDatabaseService } from '@/lib/optimized-database';
import { useOptimizedAdmin } from '@/hooks/useOptimizedAdmin';
import { supabase } from '@/utils/supabaseClient';
import DatabaseTest from '@/components/admin/DatabaseTest';

// Caricamento lazy per componenti pesanti
const AdminDashboard = dynamic(() => import('@/components/admin/OptimizedAdminDashboard').then(m => ({ default: m.AdminDashboard })), {
  loading: () => <div className="bg-gray-800/50 border border-gray-700 rounded-xl animate-pulse p-6">
    <div className="space-y-4">
      <div className="h-6 bg-gray-700 rounded w-1/4"></div>
      <div className="h-4 bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
    </div>
  </div>,
  ssr: false
});

const ARExperience = dynamic(() => import('@/components/ARExperience'), {
  loading: () => <div className="bg-black/50 border border-white/20 rounded-xl animate-pulse p-6 text-center">
    <div className="space-y-4">
      <div className="text-4xl">🔍</div>
      <div className="h-4 bg-white/10 rounded w-3/4 mx-auto"></div>
      <div className="h-33 bg-white/10 rounded w-1/2 mx-auto"></div>
    </div>
  </div>,
  ssr: false
});

export default function AdminPage() {
  const { user, role, loading } = useAuthWithRole();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white">Caricamento...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!user || (role !== 'admin' && role !== 'user' && role !== 'moderator')) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-white">Accesso Negato</h1>
          <p className="text-gray-400">Non hai i permessi per visualizzare quest'area.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminDashboard user={user} role={role} />
    </AdminLayout>
  );
}
