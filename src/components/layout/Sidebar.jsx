import {
  ClipboardList,
  Factory,
  Truck,
  Users,
  FileBarChart,
  Settings,
  LayoutDashboard,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Purchase Order",
    path: "/purchase-orders",
    icon: ClipboardList,
  },
  {
    label: "Produksi",
    path: "/production",
    icon: Factory,
  },
  {
    label: "Quality Control",
    path: "/qc",
    icon: ClipboardCheck,
  },
  {
    label: "Pengiriman",
    path: "/delivery",
    icon: Truck,
  },
  {
    label: "Customer",
    path: "/customers",
    icon: Users,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: FileBarChart,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const handleNavigate = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* =================================
          MOBILE OVERLAY
      ================================= */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =================================
          SIDEBAR
      ================================= */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen flex-col
          border-r border-slate-200
          bg-white
          shadow-xl
          transition-all duration-300

          ${collapsed ? "lg:w-[72px]" : "lg:w-64"}

          w-[260px]

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* =================================
            LOGO / HEADER
        ================================= */}

        <div
          className={`
            flex h-16 shrink-0
            items-center
            border-b border-slate-200

            ${
              collapsed
                ? "lg:justify-center lg:px-3"
                : "justify-between px-4"
            }
          `}
        >
          <div
            className={`
              flex min-w-0 items-center
              ${
                collapsed
                  ? "lg:justify-center"
                  : "gap-3"
              }
            `}
          >
            {/* Logo */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              CR
            </div>

            {/* Logo Text */}
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  Company Report
                </p>

                <p className="text-[11px] text-slate-400">
                  Internal System
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="
              rounded-lg
              p-2
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-900
              lg:hidden
            "
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =================================
            NAVIGATION
        ================================= */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Main Menu
            </p>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={handleNavigate}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `
                    group relative
                    flex items-center
                    rounded-lg
                    py-2.5
                    text-sm
                    font-medium
                    transition-all duration-200

                    ${
                      collapsed
                        ? "lg:justify-center lg:px-3"
                        : "gap-3 px-3"
                    }

                    ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />

                {!collapsed && (
                  <span className="truncate">
                    {item.label}
                  </span>
                )}

                {/* Desktop Tooltip */}
                {collapsed && (
                  <span
                    className="
                      pointer-events-none
                      absolute
                      left-full
                      z-50
                      ml-3
                      hidden
                      whitespace-nowrap
                      rounded-md
                      bg-slate-900
                      px-2.5
                      py-1.5
                      text-xs
                      font-medium
                      text-white
                      shadow-lg
                      group-hover:block
                    "
                  >
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* =================================
            COLLAPSE BUTTON
        ================================= */}

        <div className="shrink-0 border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            title={
              collapsed
                ? "Buka sidebar"
                : "Tutup sidebar"
            }
            className={`
              flex w-full
              items-center
              justify-center
              rounded-lg
              p-2
              text-slate-500
              transition-all duration-200
              hover:bg-slate-100
              hover:text-slate-900

              ${collapsed ? "h-10" : ""}
            `}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;