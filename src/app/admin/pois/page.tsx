'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PoiManagement from '@/components/admin/PoiManagement';

const AdminPoisPage = () => {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold mb-4">Gestione Punti di Interesse</h1>
      <PoiManagement />
    </AdminLayout>
  );
};

export default AdminPoisPage;
