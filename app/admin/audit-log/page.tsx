import type { Metadata } from "next";
import { getAuditLog } from "@/lib/data/admin";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Audit Log — Wanderlust Admin" };

export default async function AuditLogPage() {
  const entries = await getAuditLog();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Audit Log</h1>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No admin actions recorded yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id.toString()} className="border-t border-border">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    {entry.admin?.username ? `@${entry.admin.username}` : "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{entry.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {entry.targetType} · {entry.targetId.toString().slice(-6)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {entry.details ? JSON.stringify(entry.details) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
