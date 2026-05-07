"use client";

import AuthLayout from "@/components/features/AuthLayout";
import { PublicOnlyRoute } from "@/components/features/AuthGuard";

export default function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicOnlyRoute>
      <AuthLayout>{children}</AuthLayout>
    </PublicOnlyRoute>
  );
}
