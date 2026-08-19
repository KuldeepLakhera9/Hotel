"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Users,
  CalendarCheck,
  Star,
  ShieldCheck,
  ScrollText,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/models/User";

const NAV_ITEMS: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }>; roles: Role[] }> = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT_ADMIN"] },
  { href: "/admin/listings", label: "Listings", icon: Home, roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT_ADMIN"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT_ADMIN"] },
  { href: "/admin/bookings", label: "Bookings & Payments", icon: CalendarCheck, roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT_ADMIN"] },
  { href: "/admin/reviews", label: "Reviews", icon: Star, roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT_ADMIN"] },
  { href: "/admin/admins", label: "Admin Management", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText, roles: ["SUPER_ADMIN"] },
];

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-white">
      <div className="p-4">
        <Link href="/listings" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> Back to site
        </Link>
      </div>
      <nav className="space-y-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium",
                active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
