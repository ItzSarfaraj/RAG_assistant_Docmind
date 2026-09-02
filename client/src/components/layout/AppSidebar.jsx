import {
  LayoutDashboard,
  FlaskConical,
  FileText,
  NotebookPen,
  Search,
  Sparkles,
  Settings,
  Plus,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function AppSidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const sections = [
    {
      title: "Main",
      items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      title: "Workspace",
      items: [
        { to: "/workspace", label: "Workspace", icon: FlaskConical },
        { to: "/documents", label: "Documents", icon: FileText },
      ],
    },
    {
      title: "My Notes",
      items: [{ to: "/notes", label: "Notes", icon: NotebookPen }],
    },
    {
      title: "Tools",
      items: [
        { to: "/search", label: "Search", icon: Search },
        { to: "/ai-tools", label: "AI Tools", icon: Sparkles },
      ],
    },
  ];

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#16150F] text-[#F3EFE4] transition-all duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-[68px]" : "w-60"} md:static md:translate-x-0`}
      >
        <div
          className={`flex h-16 shrink-0 items-center border-b border-[#F3EFE4]/8 ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#F3EFE4]/10 bg-[#F3EFE4]/[0.06] text-[#E3B368]">
              <NotebookPen size={16} />
            </div>

            {!collapsed && (
              <div>
                <p className="font-[Fraunces] text-sm leading-none">DocMind</p>
                <p className="mt-1 text-[9px] text-[#F3EFE4]/35">Research workspace</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#F3EFE4]/40 hover:bg-[#F3EFE4]/[0.06] hover:text-[#F3EFE4] md:hidden"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <div className={collapsed ? "p-2" : "p-3"}>
          <NavLink
            to="/workspace"
            onClick={onClose}
            title={collapsed ? "New source" : undefined}
            className={`flex items-center rounded-lg border border-[#F3EFE4]/10 bg-[#F3EFE4]/[0.05] text-xs font-medium text-[#F3EFE4]/80 transition hover:border-[#E3B368]/30 hover:bg-[#E3B368]/[0.08] hover:text-[#E3B368] ${
              collapsed ? "h-10 justify-center" : "gap-2.5 px-3 py-2.5"
            }`}
          >
            <Plus size={15} />
            {!collapsed && "New source"}
          </NavLink>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          {sections.map((section) => (
            <div key={section.title} className="mb-5">
              {!collapsed && (
                <p className="mb-2 px-2 text-[9px] font-medium uppercase tracking-[0.15em] text-[#F3EFE4]/25">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center rounded-lg text-xs transition ${
                        collapsed ? "h-10 justify-center" : "gap-3 px-3 py-2.5"
                      } ${
                        isActive
                          ? "bg-[#F3EFE4]/[0.09] text-[#F3EFE4]"
                          : "text-[#F3EFE4]/45 hover:bg-[#F3EFE4]/[0.05] hover:text-[#F3EFE4]/80"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[#E3B368]" />
                        )}
                        <Icon size={15} strokeWidth={1.8} />
                        {!collapsed && label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#F3EFE4]/8 p-3">
          <NavLink
            to="/settings"
            onClick={onClose}
            title={collapsed ? "Settings" : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-lg text-xs transition ${
                collapsed ? "h-10 justify-center" : "gap-3 px-3 py-2.5"
              } ${
                isActive
                  ? "bg-[#F3EFE4]/[0.09] text-[#F3EFE4]"
                  : "text-[#F3EFE4]/45 hover:bg-[#F3EFE4]/[0.05] hover:text-[#F3EFE4]/80"
              }`
            }
          >
            <Settings size={15} strokeWidth={1.8} />
            {!collapsed && "Settings"}
          </NavLink>

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`mt-1 flex w-full items-center rounded-lg text-xs text-[#F3EFE4]/40 transition hover:bg-[#F3EFE4]/[0.05] hover:text-[#F3EFE4]/80 ${
              collapsed ? "h-10 justify-center" : "gap-3 px-3 py-2.5"
            }`}
            title={collapsed ? "Show sidebar" : "Hide sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={15} strokeWidth={1.8} /> : <PanelLeftClose size={15} strokeWidth={1.8} />}
            {!collapsed && "Hide sidebar"}
          </button>
        </div>
      </aside>
    </>
  );
}

export default AppSidebar;