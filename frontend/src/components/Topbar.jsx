import { Search, Bell, User } from "lucide-react";

export default function Topbar() {
  return (
    <div className="glass h-16 rounded-2xl px-6 flex items-center justify-between">

      {/* SEARCH */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-full w-96 bg-white/5 border border-accent-200/20 focus-within:ring-1 focus-within:ring-accent-500 transition">

        <Search size={16} className="text-ink-400" />

        <input
          type="text"
          placeholder="Search across all documents..."
          className="bg-transparent outline-none text-sm w-full text-ink-900 placeholder-ink-400"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Bell className="text-ink-500 cursor-pointer" size={18} />
        <User className="text-ink-500 cursor-pointer" size={18} />
      </div>

    </div>
  );
}