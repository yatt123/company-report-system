import {
  Bell,
  Menu,
  ChevronDown,
} from "lucide-react";

function Header({ onMenuClick }) {
  return (
    <header
      className="
        sticky top-0 z-30
        flex h-14 sm:h-16
        items-center
        border-b border-slate-200
        bg-white
        px-3 sm:px-4 lg:px-6
      "
    >
      {/* ================================
          MOBILE MENU
      ================================= */}

      <button
        type="button"
        onClick={onMenuClick}
        className="
          flex items-center justify-center
          rounded-lg
          p-2
          text-slate-600
          transition
          hover:bg-slate-100
          hover:text-slate-900
          lg:hidden
        "
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Title */}
      <div className="ml-2 min-w-0 lg:hidden">
        <p className="truncate text-sm font-semibold text-slate-900">
          Company Report
        </p>
      </div>

      {/* ================================
          RIGHT SIDE
      ================================= */}

      <div className="ml-auto flex items-center">
        {/* Notification */}
        <button
          type="button"
          aria-label="Notifikasi"
          className="
            relative
            rounded-lg
            p-2
            text-slate-500
            transition
            hover:bg-slate-100
            hover:text-slate-900
          "
        >
          <Bell className="h-[18px] w-[18px]" />

          {/* Notification Dot */}
          <span
            className="
              absolute
              right-1.5
              top-1.5
              h-1.5
              w-1.5
              rounded-full
              bg-red-500
              ring-2
              ring-white
            "
          />
        </button>

        {/* Divider */}
        <div className="mx-2 sm:mx-3 h-6 sm:h-7 w-px bg-slate-200" />

        {/* ================================
            ADMIN
        ================================= */}

        <button
          type="button"
          className="
            flex
            items-center
            gap-2
            rounded-lg
            p-1
            transition
            hover:bg-slate-50
          "
        >
          {/* Avatar */}
          <div
            className="
              flex
              h-8 w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-slate-900
              text-[11px]
              font-semibold
              text-white
            "
          >
            AD
          </div>

          {/* Admin Info */}
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold text-slate-900">
              Admin
            </p>

            <p className="text-[11px] text-slate-400">
              Administrator
            </p>
          </div>

          {/* Dropdown */}
          <ChevronDown
            className="
              hidden
              h-4 w-4
              text-slate-400
              sm:block
            "
          />
        </button>
      </div>
    </header>
  );
}

export default Header;