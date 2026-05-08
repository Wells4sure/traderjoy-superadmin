import Link from "next/link";
import { LayoutDashboard, Building2 } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const navItems = [
  { href: "/dashboard",   label: "Overview",    icon: LayoutDashboard },
  { href: "/businesses",  label: "Businesses",  icon: Building2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-slate-900 flex flex-col">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">TJ</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">TraderJoy</p>
            <p className="text-slate-500 text-[10px] mt-0.5">Super Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium group"
            >
              <Icon className="h-4 w-4 group-hover:text-orange-400 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}
