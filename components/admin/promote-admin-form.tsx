"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { promoteUserByUsername } from "@/lib/actions/admin/users";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function PromoteAdminForm() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPPORT_ADMIN">("ADMIN");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await promoteUserByUsername(username, role);
          if (!result.success) toast.error(result.error);
          else {
            toast.success(`@${username} is now ${role}`);
            setUsername("");
          }
        });
      }}
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-white p-4"
    >
      <div>
        <Label htmlFor="promote-username">Username</Label>
        <Input
          id="promote-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. wanderlust_host"
          className="mt-1 w-56"
          required
        />
      </div>
      <div>
        <Label htmlFor="promote-role">Role</Label>
        <Select
          id="promote-role"
          value={role}
          onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPPORT_ADMIN")}
          className="mt-1 w-40"
        >
          <option value="ADMIN">ADMIN</option>
          <option value="SUPPORT_ADMIN">SUPPORT_ADMIN</option>
        </Select>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Promoting..." : "Promote to admin"}
      </Button>
    </form>
  );
}
