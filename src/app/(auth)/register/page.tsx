"use client";

import { useState } from "react";
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
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await registerUser(values.name, values.email, values.password);
      toast.success("Welcome to Finance OS!");
      window.location.href = "/";
    } catch (err) {
      toast.error(apiError(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Create your account
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Start tracking your finances in minutes — it&apos;s completely free.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <AppInput
          label="Full name"
          placeholder="Jane Doe"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
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
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <AppButton type="submit" className="mt-2 h-11 w-full text-sm" loading={submitting}>
          Create account
        </AppButton>
      </form>

      <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        Already a member?
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
        >
          Sign in to your account
        </Link>
      </p>
    </div>
  );
}
