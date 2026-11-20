import type { Metadata } from "next";
import { AuthShell } from "../components/auth-shell";
import { SignupFlow } from "../components/auth/signup-flow";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create an account, verify your email, and access the protected dashboard.",
};

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      description="Choose your details, then verify your email with a six-digit code. It only takes a minute."
    >
      <SignupFlow />
    </AuthShell>
  );
}
