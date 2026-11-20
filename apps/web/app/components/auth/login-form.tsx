"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { validateEmail, validatePassword } from "@/lib/validation";
import { Alert } from "../ui/alert";
import { Button, buttonVariants } from "../ui/button";
import { Input } from "../ui/input";
import { PasswordInput } from "../ui/password-input";
import { Spinner } from "../ui/spinner";

export function LoginForm() {
  const router = useRouter();
  const { user, loading, refreshUser, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) {
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/auth/login", {
        email: email.trim(),
        password,
      });
      await refreshUser();
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We could not sign you in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSwitchAccount() {
    setSigningOut(true);

    try {
      await logout();
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4" aria-label="Checking your session">
        <span className="block h-11 w-full animate-pulse rounded-xl bg-slate-100" />
        <span className="block h-11 w-full animate-pulse rounded-xl bg-slate-100" />
        <span className="block h-11 w-full animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="space-y-5">
        <Alert variant="success" title="You are already signed in">
          Your session is active as{" "}
          <span className="font-semibold">
            {user.email ?? user.username ?? "your account"}
          </span>
          .
        </Alert>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/dashboard"
            className={buttonVariants({ className: "w-full" })}
          >
            Go to dashboard
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Button
            variant="secondary"
            onClick={() => void handleSwitchAccount()}
            disabled={signingOut}
            className="w-full"
          >
            {signingOut ? <Spinner /> : null}
            {signingOut ? "Signing out..." : "Use another account"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <Input
        label="Email address"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        icon={Mail}
        required
        value={email}
        error={emailError ?? undefined}
        onChange={(event) => {
          setEmail(event.target.value);
          if (emailError) setEmailError(null);
          if (formError) setFormError(null);
        }}
      />

      <div>
        <PasswordInput
          label="Password"
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          icon={LockKeyhole}
          required
          value={password}
          error={passwordError ?? undefined}
          onChange={(event) => {
            setPassword(event.target.value);
            if (passwordError) setPasswordError(null);
            if (formError) setFormError(null);
          }}
        />
        <div className="mt-2 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? <Spinner /> : null}
        {submitting ? "Signing in..." : "Sign in"}
        {!submitting ? (
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        ) : null}
      </Button>

      <p className="text-center text-sm text-slate-600">
        New to Internship Project?{" "}
        <Link
          href="/signup"
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
