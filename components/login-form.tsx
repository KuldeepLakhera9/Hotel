"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function onSubmit(data: LoginInput) {
    startTransition(async () => {
      const result = await loginAction(data);
      if (result && !result.success) toast.error(result.error);
    });
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Welcome back</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" {...register("username")} className="mt-1" autoComplete="username" />
          {errors.username && <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} className="mt-1" autoComplete="current-password" />
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Logging in..." : "Login"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        New to Wanderlust?{" "}
        <Link href="/signup" className="font-semibold text-primary">
          Sign up
        </Link>
      </p>
    </div>
  );
}
