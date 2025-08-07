"use client";

import React from 'react';
import AppLayout from "@/components/admin/AppLayout";
import { NewsManagement } from "@/components/NewsManagement";
import { useAuthWithRole } from "@/hooks/useAuthWithRole";

export default function NewsPage() {
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
      <NewsManagement 
        isOpen={true} 
        onClose={() => {}} 
        currentUser={user}
      />
    </AppLayout>
  );
}