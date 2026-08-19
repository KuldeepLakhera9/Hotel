"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { signupAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  function onSubmit(data: SignupInput) {
    startTransition(async () => {
      const result = await signupAction(data);
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Create your account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" {...register("username")} className="mt-1" autoComplete="username" />
          {errors.username && <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} className="mt-1" autoComplete="email" />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} className="mt-1" autoComplete="new-password" />
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Creating account..." : "Sign up"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </div>
  );
}
