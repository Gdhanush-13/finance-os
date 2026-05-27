"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import AppInput from "@/components/shared/AppInput";
import AppButton from "@/components/shared/AppButton";
import { apiError } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      router.replace("/");
    } catch (err) {
      toast.error(apiError(err, "Login failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Welcome back
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Sign in to your Finance&nbsp;OS account to continue managing your finances.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <AppInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <AppInput
          label="Password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <AppButton type="submit" className="mt-2 h-11 w-full text-sm" loading={submitting}>
          Sign in
        </AppButton>
      </form>

      <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        New here?
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link
          href="/register"
          className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
        >
          Create a free account
        </Link>
      </p>
    </div>
  );
}
