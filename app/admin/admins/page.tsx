import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getAllUsersAdmin } from "@/lib/data/admin";
import { Badge } from "@/components/ui/badge";
import { UserRoleSelect } from "@/components/admin/user-actions";
import { PromoteAdminForm } from "@/components/admin/promote-admin-form";

export const metadata: Metadata = { title: "Admin Management — Wanderlust Admin" };

const ADMIN_TIER = new Set(["SUPER_ADMIN", "ADMIN", "SUPPORT_ADMIN"]);

export default async function AdminManagementPage() {
  const session = await auth();
  const users = await getAllUsersAdmin();
  const admins = users.filter((u) => ADMIN_TIER.has(u.role));

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Admin Management</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Promote an existing user to ADMIN or SUPPORT_ADMIN, or demote one back to USER from the table below.
      </p>

      <div className="mb-6">
        <PromoteAdminForm />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((user) => (
              <tr key={user._id.toString()} className="border-t border-border">
                <td className="px-4 py-3">
                  <p className="font-medium">@{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  {session?.user?.id === user._id.toString() ? (
                    <Badge variant="outline">{user.role} (you)</Badge>
                  ) : (
                    <UserRoleSelect userId={user._id.toString()} role={user.role} />
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.status === "active" ? "success" : "destructive"}>{user.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
