import React from "react";
import { NavLink } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";
import {
  LayoutDashboard,
  Users,
  Send,
  Settings,
  Mailbox,
  X,
  Ban,
  Globe,
  FileText,
  FileCode,
  Target,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({
  to,
  icon,
  label,
}) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? "bg-blue-600 text-white"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
      }`
    }
  >
    {icon}
    <span className="ml-4">{label}</span>
  </NavLink>
);

interface SidebarProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setOpen }) => {
  const user = useUserStore((state) => state.user);
  const { theme } = useTheme();
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col w-64 z-40 border-r transition-all duration-300 ease-in-out lg:translate-x-0 
          ${
            theme === "dark"
              ? "bg-gray-900 border-gray-800 text-gray-100"
              : "bg-white border-gray-200 text-gray-900"
          } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between h-16 border-b px-4 ${
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center">
            <Mailbox
              className={`h-8 w-8 ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <span className="ml-2 text-lg font-bold">Power Panel</span>
          </div>
          <button
            className={`lg:hidden ${
              theme === "dark"
                ? "text-gray-400 hover:text-white"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {/* SUPERADMIN */}
            {user?.role === "superadmin" && (
              <NavItem to="/app/dashboard" icon={<Users className="h-5 w-5" />} label="Tenants" />
              
            )}

            {/* ADMIN */}
            {user?.role === "admin" && (
              <>
                <NavItem to="/app/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
                <NavItem to="/app/logs" icon={<FileText className="h-5 w-5" />} label="Logs" />
                <NavItem to="/app/domains" icon={<Globe className="h-5 w-5" />} label="Domains" />
                <NavItem to="/app/templates" icon={<FileCode className="h-5 w-5" />} label="Templates" />
                <NavItem to="/app/suppressions" icon={<Ban className="h-5 w-5" />} label="Suppressions" />
                <NavItem to="/app/team" icon={<Users className="h-5 w-5" />} label="Team" />
                  <NavItem to="/app/campaigns" icon={<Target className="h-5 w-5" />} label="Campaigns" />
                   <NavItem to="/app/analytics" icon={<Target className="h-5 w-5" />} label="Analytics" />

                  
              </>
            )}

            {/* USER */}
            {user?.role === "user" && (
              <>
                <NavItem to="/app/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
                <NavItem to="/app/send" icon={<Send className="h-5 w-5" />} label="Send Message" />
                <NavItem to="/app/logs" icon={<FileText className="h-5 w-5" />} label="Logs" />
                <NavItem to="/app/domains" icon={<Globe className="h-5 w-5" />} label="Domains" />
                <NavItem to="/app/templates" icon={<FileCode className="h-5 w-5" />} label="Templates" />
                <NavItem to="/app/suppressions" icon={<Ban className="h-5 w-5" />} label="Suppressions" />
                <NavItem to="/app/campaigns" icon={<Target className="h-5 w-5" />} label="Campaigns" />
                <NavItem to="/app/analytics" icon={<Target className="h-5 w-5" />} label="Analytics" />
                   
              </>
            )}
          </nav>
        </div>

        {/* Settings */}
        <div
          className={`p-4 border-t ${
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
        </div>
      </div>
    </>
  );
};
