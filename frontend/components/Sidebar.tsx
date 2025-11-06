import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { UserRole } from '../constants';
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
} from 'lucide-react';

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
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
  const user = useAuthStore((state) => state.user);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-800 border-r border-gray-700 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-700 px-4">
          <div className="flex items-center">
            <Mailbox className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-white text-lg font-bold">Power Panel</span>
          </div>
          <button
            className="text-gray-400 hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {user?.role === UserRole.SUPERADMIN && (
              <>
                <NavItem to="/" icon={<Users className="h-5 w-5" />} label="Tenants" />
              </>
            )}

            {user?.role === UserRole.ADMIN && (
              <>
                <NavItem to="/" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
                <NavItem to="/logs" icon={<FileText className="h-5 w-5" />} label="Logs" />
                <NavItem to="/domains" icon={<Globe className="h-5 w-5" />} label="Domains" />
                <NavItem to="/templates" icon={<FileCode className="h-5 w-5" />} label="Templates" />
                <NavItem to="/suppressions" icon={<Ban className="h-5 w-5" />} label="Suppressions" />
                <NavItem to="/team" icon={<Users className="h-5 w-5" />} label="Team" />
              </>
            )}

            {user?.role === UserRole.USER && (
              <>
                <NavItem to="/" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
                <NavItem to="/send" icon={<Send className="h-5 w-5" />} label="Send Message" />
                <NavItem to="/logs" icon={<FileText className="h-5 w-5" />} label="Logs" />
                <NavItem to="/domains" icon={<Globe className="h-5 w-5" />} label="Domains" />
                <NavItem to="/templates" icon={<FileCode className="h-5 w-5" />} label="Templates" />
                <NavItem to="/suppressions" icon={<Ban className="h-5 w-5" />} label="Suppressions" />
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700">
          <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
        </div>
      </div>
    </>
  );
};
