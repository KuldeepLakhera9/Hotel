"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setUserStatus, setUserRole } from "@/lib/actions/admin/users";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ROLES, type Role } from "@/lib/constants/user";

export function UserStatusActions({ userId, status }: { userId: string; status: "active" | "suspended" | "banned" }) {
  const [isPending, startTransition] = useTransition();

  function setStatus(next: "active" | "suspended" | "banned") {
    startTransition(async () => {
      const result = await setUserStatus(userId, next);
      if (!result.success) toast.error(result.error);
      else toast.success(`User marked ${next}`);
    });
  }

  return (
    <div className="flex gap-2">
      {status !== "active" && (
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => setStatus("active")}>
          Reactivate
        </Button>
      )}
      {status !== "suspended" && (
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => setStatus("suspended")}>
          Suspend
        </Button>
      )}
      {status !== "banned" && (
        <Button type="button" variant="destructive" size="sm" disabled={isPending} onClick={() => setStatus("banned")}>
          Ban
        </Button>
      )}
    </div>
  );
}

export function UserRoleSelect({ userId, role }: { userId: string; role: Role }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={role}
      disabled={isPending}
      className="h-9 w-40 text-xs"
      onChange={(e) => {
        const next = e.target.value as Role;
        startTransition(async () => {
          const result = await setUserRole(userId, next);
          if (!result.success) toast.error(result.error);
          else toast.success(`Role changed to ${next}`);
        });
      }}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </Select>
  );
}
