"use client";

import React from 'react';
import AppLayout from "@/components/admin/AppLayout";
import { AppSettings } from "@/components/admin/AppSettings";
import { useAuthWithRole } from "@/hooks/useAuthWithRole";
import { Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user, role, loading } = useAuthWithRole();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white">Caricamento...</span>
        </div>
      </AppLayout>
    );
  }

  if (!user || role !== 'admin') {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Accesso Negato</h2>
          <p className="text-gray-400">Solo gli amministratori possono accedere alle impostazioni</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full">
        <AppSettings 
          isOpen={true} 
          onClose={() => {}} 
          currentUser={user}
        />
      </div>
    </AppLayout>
  );
}