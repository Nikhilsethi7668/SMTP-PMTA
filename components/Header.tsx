
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { User, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex justify-between items-center">
      <button 
        className="text-gray-400 hover:text-white lg:hidden"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="hidden lg:block">
        {/* Can be used for breadcrumbs or page title */}
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
        <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-6 w-6 text-white" />
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" /> 
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};
