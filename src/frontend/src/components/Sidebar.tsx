import { cn } from "@/lib/utils";
import { Bell, LogOut, Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { UserProfile } from "../hooks/useQueries";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  profile: UserProfile;
  notificationCount?: number;
}

export default function Sidebar({
  items,
  activeSection,
  onSectionChange,
  profile,
  notificationCount = 0,
}: SidebarProps) {
  const { clear, identity } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabel =
    profile.role === "admin"
      ? "Administrator"
      : profile.role === "pa"
        ? "Personal Assistant"
        : "Customer";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Shield className="size-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">
              AppointMate
            </span>
            <p className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">
              {roleLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" data-ocid="nav.section">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onSectionChange(item.id);
              setMobileOpen(false);
            }}
            data-ocid={`nav.${item.id}.link`}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              activeSection === item.id
                ? "bg-white/20 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Profile card */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-9 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-yellow-900">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {profile.name}
              </p>
              {profile.customerNumber && (
                <p className="text-xs text-white/50">
                  #{profile.customerNumber}
                </p>
              )}
              <p className="text-xs text-white/50 truncate">
                {identity?.getPrincipal().toString().slice(0, 12)}...
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clear}
            data-ocid="nav.logout.button"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium transition-all"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 sidebar-gradient flex-col h-screen sticky top-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 sidebar-gradient flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-white" />
          <span className="text-base font-bold text-white">AppointMate</span>
        </div>
        <div className="flex items-center gap-2">
          {notificationCount > 0 && (
            <div className="relative">
              <Bell className="size-5 text-white/70" />
              <span className="absolute -top-1 -right-1 size-4 bg-yellow-400 text-yellow-900 text-[9px] font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white p-1"
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 sidebar-gradient h-full overflow-y-auto">
            <SidebarContent />
          </div>
          <button
            type="button"
            aria-label="Close menu"
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
