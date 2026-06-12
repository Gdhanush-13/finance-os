"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardHeader, CardBody } from "@/components/shared/AppCard";
import AppButton from "@/components/shared/AppButton";
import AppInput from "@/components/shared/AppInput";
import { useAuth } from "@/auth/AuthContext";
import { apiError } from "@/lib/api";
import { cleanPayload } from "@/lib/cleanPayload";

const profileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  currency: z.string().min(3).max(3).default("USD"),
  timezone: z.string().optional(),
  avatarUrl: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      currency: user?.currency || "USD",
      timezone: user?.timezone || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (values: ProfileValues) => {
    try {
      await updateProfile(cleanPayload(values));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const onPasswordSubmit = async (values: PasswordValues) => {
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success("Password changed");
      passwordForm.reset();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account settings.</p>
      </div>

      <Card>
        <CardHeader title="Personal Information" />
        <CardBody>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="max-w-md space-y-4">
            <AppInput label="Full name" error={profileForm.formState.errors.name?.message} {...profileForm.register("name")} />
            <AppInput label="Preferred currency" maxLength={3} error={profileForm.formState.errors.currency?.message} {...profileForm.register("currency")} />
            <AppInput label="Timezone" placeholder="America/New_York" {...profileForm.register("timezone")} />
            <AppInput label="Avatar URL" placeholder="https://..." error={profileForm.formState.errors.avatarUrl?.message} {...profileForm.register("avatarUrl")} />
            <AppButton type="submit" loading={profileForm.formState.isSubmitting}>Save changes</AppButton>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Change Password" />
        <CardBody>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="max-w-md space-y-4">
            <AppInput label="Current password" type="password" error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register("currentPassword")} />
            <AppInput label="New password" type="password" error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register("newPassword")} />
            <AppButton type="submit" loading={passwordForm.formState.isSubmitting}>Change password</AppButton>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
