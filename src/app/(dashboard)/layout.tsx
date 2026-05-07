"use client";

import MainLayout from "@/components/features/MainLayout";
import { ProtectedRoute } from "@/components/features/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}
