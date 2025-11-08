import React from "react";
import { useTheme } from "@/components/theme-provider";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const { theme } = useTheme();

  return (
    <div
      className={`flex h-screen w-full transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};
