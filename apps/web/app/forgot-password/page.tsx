import type { Metadata } from "next";
import { AuthShell } from "../components/auth-shell";
import { ForgotPasswordFlow } from "../components/auth/forgot-password-flow";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your password with a verified email code.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="We will email you a six-digit code. Use it to choose a new password and regain access."
    >
      <ForgotPasswordFlow />
    </AuthShell>
  );
}
