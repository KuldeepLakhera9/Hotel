"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User, ROLES, type Role } from "@/lib/models/User";
import { hasPermission } from "@/lib/rbac";
import { logAdminAction } from "@/lib/audit";

type ActionResult = { success: true } | { success: false; error: string };

const ADMIN_TIER: Role[] = ["SUPER_ADMIN", "ADMIN", "SUPPORT_ADMIN"];

export async function setUserStatus(
  targetUserId: string,
  status: "active" | "suspended" | "banned"
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "manageUsers")) {
    return { success: false, error: "You do not have permission to manage users" };
  }
  if (targetUserId === session.user.id) {
    return { success: false, error: "You cannot change your own status" };
  }

  await connectDB();
  const target = await User.findById(targetUserId);
  if (!target) return { success: false, error: "User not found" };

  // A plain ADMIN can't act on another admin-tier account — only
  // SUPER_ADMIN can. Prevents an ADMIN from banning a peer or a SUPER_ADMIN.
  if (session.user.role !== "SUPER_ADMIN" && ADMIN_TIER.includes(target.role)) {
    return { success: false, error: "You cannot modify another admin's account" };
  }

  target.status = status;
  await target.save();

  await logAdminAction(session.user.id, `USER_STATUS_${status.toUpperCase()}`, "User", targetUserId, {
    username: target.username,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function setUserRole(targetUserId: string, role: Role): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "manageAdmins")) {
    return { success: false, error: "You do not have permission to manage admin roles" };
  }
  if (targetUserId === session.user.id) {
    return { success: false, error: "You cannot change your own role" };
  }
  if (!ROLES.includes(role)) {
    return { success: false, error: "Invalid role" };
  }

  await connectDB();
  const target = await User.findByIdAndUpdate(targetUserId, { role }, { new: true });
  if (!target) return { success: false, error: "User not found" };

  await logAdminAction(session.user.id, "USER_ROLE_CHANGED", "User", targetUserId, {
    username: target.username,
    newRole: role,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/admins");
  return { success: true };
}

/** "Invite an admin" by promoting an existing user, looked up by username — no email-invite/accept flow. */
export async function promoteUserByUsername(username: string, role: Role): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "manageAdmins")) {
    return { success: false, error: "You do not have permission to manage admin roles" };
  }
  if (!ADMIN_TIER.includes(role)) {
    return { success: false, error: "Can only promote to ADMIN or SUPPORT_ADMIN" };
  }

  await connectDB();
  const target = await User.findOne({ username: username.trim() });
  if (!target) return { success: false, error: `No user found with username "${username}"` };
  if (target._id.toString() === session.user.id) {
    return { success: false, error: "You cannot change your own role" };
  }

  target.role = role;
  await target.save();

  await logAdminAction(session.user.id, "USER_PROMOTED", "User", target._id.toString(), {
    username: target.username,
    newRole: role,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/admins");
  return { success: true };
}
