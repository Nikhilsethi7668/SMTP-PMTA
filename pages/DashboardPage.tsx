import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { UserRole } from '../constants';
import { useAuthStore } from '../store/useAuthStore';

// pages
import TenantListPage from './TenantListPage';
import TenantDetailPage from './TenantDetailPage';
import UserDashboardPage from './UserDashboardPage';
import SendMessagePage from './SendMessagePage';
import SuppressionsPage from './SuppressionsPage';
import DomainsPage from './DomainsPage';
import MessageLogsPage from './MessageLogsPage';
import SettingsPage from './SettingsPage';
import TemplatesPage from './TemplatesPage';
import TeamPage from './TeamPage';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <Layout>
      <Routes>
        {/* SUPERADMIN */}
        {user.role === UserRole.SUPERADMIN && (
          <>
            <Route path="/" element={<TenantListPage />} />
            <Route path="/tenants/:tenantId" element={<TenantDetailPage />} />
          </>
        )}

        {/* ADMIN */}
        {user.role === UserRole.ADMIN && (
          <>
            <Route path="/" element={<TenantDetailPage />} />
            <Route path="/logs" element={<MessageLogsPage />} />
            <Route path="/domains" element={<DomainsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/suppressions" element={<SuppressionsPage />} />
            <Route path="/team" element={<TeamPage />} />
          </>
        )}

        {/* USER */}
        {user.role === UserRole.USER && (
          <>
            <Route path="/" element={<UserDashboardPage />} />
            <Route path="/send" element={<SendMessagePage />} />
            <Route path="/logs" element={<MessageLogsPage />} />
            <Route path="/domains" element={<DomainsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/suppressions" element={<SuppressionsPage />} />
          </>
        )}

        {/* COMMON */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Layout>
  );
};

export default DashboardPage;
