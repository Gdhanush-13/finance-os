"use client";

import MainLayout from "@/components/features/MainLayout";
import { ProtectedRoute } from "@/components/features/AuthGuard";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <MainLayout>
        <ErrorBoundary>{children}</ErrorBoundary>
      </MainLayout>
    </ProtectedRoute>
  );
}
