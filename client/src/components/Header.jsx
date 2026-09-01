function Header({ user, onLogout }) {
  return (
    <header className="flex h-[70px] shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-5 sm:px-8">
      {/* =========================
                LEFT — BREADCRUMB
            ========================= */}

      <div className="flex items-center gap-2 text-xs">
        <span className="text-zinc-400">Workspace</span>

        <span className="text-zinc-300">/</span>

        <span className="font-medium text-zinc-700">Document Assistant</span>
      </div>

      {/* =========================
                RIGHT — USER
            ========================= */}

      <div className="flex items-center gap-3">
        {/* Avatar */}

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

        {/* User Information */}

        <div className="hidden flex-col sm:flex">
          <span className="text-xs font-semibold text-zinc-800">
            {user?.name}
          </span>

          <span className="mt-0.5 max-w-[180px] truncate text-[10px] text-zinc-400">
            {user?.email}
          </span>
        </div>

        {/* Logout */}

        <button
          onClick={onLogout}
          className="
                        ml-1 rounded-lg
                        border border-zinc-200
                        bg-white
                        px-3 py-1.5
                        text-[11px]
                        font-medium
                        text-zinc-600
                        transition
                        hover:border-zinc-300
                        hover:bg-zinc-50
                        hover:text-zinc-900
                    "
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
