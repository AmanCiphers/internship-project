import type { Metadata } from "next";
import { AuthShell } from "../components/auth-shell";
import { LoginForm } from "../components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Internship Project account.",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your account"
      description="Enter the email and password you used when creating your account."
    >
      <LoginForm />
    </AuthShell>
  );
}
