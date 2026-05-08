"use client";

import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <a
      href="#"
      onClick={async (e) => {
        e.preventDefault();
        await fetch("/api/auth", { method: "DELETE" });
        window.location.href = "/login";
      }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium cursor-pointer"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </a>
  );
}
