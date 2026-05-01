import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthContext";
import { Card, CardBody, CardHeader } from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import { api, apiError } from "../lib/api";

const profileSchema = z.object({
  name: z.string().min(2),
  currency: z.string().min(3).max(3),
  timezone: z.string().min(1),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Min 8 characters"),
});

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const {
    register: rp,
    handleSubmit: hsp,
    formState: { errors: pe },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      currency: user?.currency || "USD",
      timezone: user?.timezone || "UTC",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  const {
    register: rpw,
    handleSubmit: hspw,
    reset: resetPwd,
    formState: { errors: pwe },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  const onProfile = async (values) => {
    setSavingProfile(true);
    try {
      await updateProfile(values);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const onPassword = async (values) => {
    setSavingPwd(true);
    try {
      await api.post("/auth/change-password", values);
      toast.success("Password changed");
      resetPwd();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
        <p className="text-sm text-slate-500">Manage your account preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Personal" subtitle="Your basic info" />
          <CardBody>
            <form onSubmit={hsp(onProfile)} className="space-y-4">
              <Input label="Name" error={pe.name?.message} {...rp("name")} />
              <Input
                label="Default currency"
                maxLength={3}
                error={pe.currency?.message}
                {...rp("currency")}
              />
              <Input label="Timezone" error={pe.timezone?.message} {...rp("timezone")} />
              <Input label="Avatar URL" error={pe.avatarUrl?.message} {...rp("avatarUrl")} />
              <Button type="submit" loading={savingProfile}>
                Save profile
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Password" subtitle="Update your password" />
          <CardBody>
            <form onSubmit={hspw(onPassword)} className="space-y-4">
              <Input
                label="Current password"
                type="password"
                error={pwe.currentPassword?.message}
                {...rpw("currentPassword")}
              />
              <Input
                label="New password"
                type="password"
                error={pwe.newPassword?.message}
                {...rpw("newPassword")}
              />
              <Button type="submit" loading={savingPwd}>
                Change password
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
