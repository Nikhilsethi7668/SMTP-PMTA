import React from "react";
import { Button } from "./ui/Button";
import { User, LogOut, Menu } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore"; // adjust path if needed

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    console.log("User logged out");
    // Optionally redirect to login page here
    // navigate('/auth?auth=login');
  };

  return (
    <header className="sticky top-0 z-20 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex justify-between items-center">
      {/* Menu (mobile) */}
      <button
        className="text-gray-400 hover:text-white lg:hidden"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="hidden lg:block">{/* Breadcrumbs / Page Title */}</div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="text-right">
              <p className="font-semibold text-white">
                {user.name || "Unnamed User"}
              </p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>

            <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-white" />
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </>
        ) : (
          <p className="text-gray-400 text-sm">Not logged in</p>
        )}
      </div>
    </header>
  );
};
