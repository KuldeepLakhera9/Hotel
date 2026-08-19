import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // proxy.ts already redirects non-admin-tier roles away from /admin, but
  // every admin Server Action re-checks role independently — this layout
  // does too, rather than trusting the proxy pass as sufficient on its own.
  if (!session?.user || !hasPermission(session.user.role, "viewAdminPanel")) {
    redirect("/listings");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={session.user.role} />
      <div className="flex-1 overflow-x-auto">
        <div className="border-b border-border bg-white px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">@{session.user.username}</span> ·{" "}
            <span className="font-medium text-foreground">{session.user.role}</span>
          </p>
        </div>
        <main className="p-6">{children}</main>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
