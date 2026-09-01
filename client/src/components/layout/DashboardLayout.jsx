import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import AppSidebar from "./AppSidebar";
import Header from "../Header";

function DashboardLayout({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname === "/notes" ||
      location.pathname.startsWith("/notes/")
    ) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F4EC] text-[#22201A]">
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() =>
          setSidebarCollapsed((value) => !value)
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center border-b border-[#E6E1D3] bg-white px-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-[#75705F] transition hover:bg-[#F7F4EC] hover:text-[#22201A]"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>

        <Header user={user} onLogout={onLogout} />

        <main className="min-h-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;