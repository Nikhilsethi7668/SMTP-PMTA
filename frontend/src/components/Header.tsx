import React from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";
import { ModeToggle } from "@/components/mode-toggle";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  const handleLogout = () => {
    clearUser(); // ✅ Clear user session from Zustand
    navigate("/auth?auth=login"); // Redirect to login page
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 p-4 backdrop-blur-sm">
      {/* Mobile Sidebar Toggle */}
      <button
        className="text-muted-foreground hover:text-foreground lg:hidden"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Optional center area (page title / breadcrumbs) */}
      <div className="hidden lg:block"></div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* ✅ Theme toggle */}
        <ModeToggle />

        {user ? (
          <>
            {/* User info */}
            <div className="hidden text-right sm:block">
              <p className="font-semibold text-foreground">{user.full_name || "Unnamed User"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            {/* User avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary shrink-0">
              <User className="h-5 w-5 text-white" />
            </div>

            {/* Logout button */}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
            Log In
          </Button>
        )}
      </div>
    </header>
  );
};
