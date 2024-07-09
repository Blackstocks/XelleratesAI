'use client';

import { useEffect, useState } from 'react';
import AdminDashboard from '@/components/AdminDashboard';

const AdminPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming middleware has already verified the user, set loading to false
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AdminDashboard />;
};

export default AdminPage;
