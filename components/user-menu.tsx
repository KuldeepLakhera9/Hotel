"use client";

import Link from "next/link";
import { Briefcase, Heart, LayoutDashboard, LogOut, Menu, Plus, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/actions/auth";
import type { Role } from "@/lib/models/User";

const ADMIN_ROLES = new Set<Role>(["SUPER_ADMIN", "ADMIN", "SUPPORT_ADMIN"]);

export function UserMenu({ username, role }: { username: string; role: Role }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border py-1 pl-3 pr-1 shadow-sm hover:shadow-md">
        <Menu className="size-4" />
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {username.charAt(0).toUpperCase()}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Logged in as @{username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/bookings">
            <Briefcase className="size-4 text-primary" /> My Booked Stays
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wishlist">
            <Heart className="size-4 text-primary" /> Saved Wishlist
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/host/dashboard">
            <LayoutDashboard className="size-4 text-primary" /> Host Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/listings/new">
            <Plus className="size-4 text-primary" /> Add New Listing
          </Link>
        </DropdownMenuItem>
        {ADMIN_ROLES.has(role) && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <ShieldCheck className="size-4 text-primary" /> Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={logoutAction} className="w-full">
            <button type="submit" className="flex w-full items-center gap-2 text-destructive">
              <LogOut className="size-4" /> Logout
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
