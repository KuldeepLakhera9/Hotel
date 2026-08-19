import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getAllUsersAdmin } from "@/lib/data/admin";
import { hasPermission } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { UserStatusActions, UserRoleSelect } from "@/components/admin/user-actions";

export const metadata: Metadata = { title: "Manage Users — Wanderlust Admin" };

const STATUS_VARIANT = {
  active: "success",
  suspended: "warning",
  banned: "destructive",
} as const;

export default async function AdminUsersPage() {
  const session = await auth();
  const canManageUsers = hasPermission(session?.user?.role, "manageUsers");
  const canManageAdmins = hasPermission(session?.user?.role, "manageAdmins");
  const users = await getAllUsersAdmin();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Users ({users.length})</h1>

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              {canManageUsers && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id.toString()} className="border-t border-border">
                <td className="px-4 py-3">
                  <p className="font-medium">@{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  {canManageAdmins && session?.user?.id !== user._id.toString() ? (
                    <UserRoleSelect userId={user._id.toString()} role={user.role} />
                  ) : (
                    <Badge variant="outline">{user.role}</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[user.status]}>{user.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                {canManageUsers && (
                  <td className="px-4 py-3">
                    {session?.user?.id !== user._id.toString() && (
                      <UserStatusActions userId={user._id.toString()} status={user.status} />
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
