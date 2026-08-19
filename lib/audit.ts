import { AuditLog, type AuditTargetType } from "@/lib/models/AuditLog";

export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: AuditTargetType,
  targetId: string,
  details?: Record<string, unknown>
) {
  await AuditLog.create({ admin: adminId, action, targetType, targetId, details });
}
