import type { Role } from "@/lib/models/User";

// Single source of truth for what each admin-tier role can do. Both the
// sidebar (which nav items render) and every admin Server Action (which
// re-checks role on every call, never trusting client state) read from
// this — one place to change if the policy changes, no risk of the UI and
// the enforcement drifting apart.
export const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "SUPPORT_ADMIN"];

export const PERMISSIONS = {
  viewAdminPanel: ["SUPER_ADMIN", "ADMIN", "SUPPORT_ADMIN"],
  manageListings: ["SUPER_ADMIN", "ADMIN"], // deactivate/reactivate/delete
  manageUsers: ["SUPER_ADMIN", "ADMIN"], // ban/suspend/reactivate
  manageReviews: ["SUPER_ADMIN", "ADMIN"], // delete
  issueRefunds: ["SUPER_ADMIN"],
  manageAdmins: ["SUPER_ADMIN"], // change roles to/from ADMIN/SUPPORT_ADMIN
  viewAuditLog: ["SUPER_ADMIN"],
} as const satisfies Record<string, Role[]>;

export function hasPermission(role: Role | undefined, permission: keyof typeof PERMISSIONS): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}
