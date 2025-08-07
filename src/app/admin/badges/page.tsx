"use client";

import React from 'react';
import AppLayout from "@/components/admin/AppLayout";
import { GamificationManagement } from "@/components/admin/GamificationManagement";
import { useAuthWithRole } from "@/hooks/useAuthWithRole";

export default function BadgesPage() {
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

  return (
    <AppLayout>
      <GamificationManagement 
        isOpen={true} 
        onClose={() => {}} 
        currentUser={user}
      />
    </AppLayout>
  );
}