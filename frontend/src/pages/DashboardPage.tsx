import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useUserStore } from "../store/useUserStore";
import { useTheme } from "@/components/theme-provider";

// import your actual pages later
import TenantListPage from "./TenantListPage";
import TenantDetailPage from "./TenantDetailPage";
import UserDashboardPage from "./UserDashboardPage";
// import SendMessagePage from "./SendMessagePage";
// import SuppressionsPage from "./SuppressionsPage";
// import DomainsPage from "./DomainsPage";
// import MessageLogsPage from "./MessageLogsPage";
// import SettingsPage from "./SettingsPage";
// import TemplatesPage from "./TemplatesPage";
// import TeamPage from "./TeamPage";

enum UserRole {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  USER = "user",
}

const DashboardPage: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const { theme } = useTheme(); // get current theme (light, dark, system)

  // ✅ redirect if not logged in
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-950 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <Layout>
        <Routes>
          {/* SUPERADMIN */}
          {user.role === UserRole.SUPERADMIN && (
            <>
              <Route path="/app/dashboard" element={<TenantListPage/>} />
              <Route path="/tenants/:tenantId" element={<TenantDetailPage/>} />
            </>
          )}

          {/* ADMIN */}
          {user.role === UserRole.ADMIN && (
            <>
              <Route path="/app/dashboard" element={<TenantDetailPage/>} />
              <Route path="/logs" element={<div>MessageLogsPage</div>} />
              <Route path="/domains" element={<div>DomainsPage</div>} />
              <Route path="/templates" element={<div>TemplatesPage</div>} />
              <Route path="/suppressions" element={<div>SuppressionsPage</div>} />
              <Route path="/team" element={<div>TeamPage</div>} />
            </>
          )}

          {/* USER */}
          {user.role === UserRole.USER && (
            <>
              <Route path="/app/dashboard" element={<UserDashboardPage/>} />
              <Route path="/send" element={<div>SendMessagePage</div>} />
              <Route path="/logs" element={<div>MessageLogsPage</div>} />
              <Route path="/domains" element={<div>DomainsPage</div>} />
              <Route path="/templates" element={<div>TemplatesPage</div>} />
              <Route path="/suppressions" element={<div>SuppressionsPage</div>} />
            </>
          )}

          {/* COMMON ROUTES */}
          <Route path="/settings" element={<div>SettingsPage</div>} />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </Layout>
    </div>
  );
};

export default DashboardPage;
