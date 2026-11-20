"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Mail,
  RefreshCw,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateVerificationCode,
} from "@/lib/validation";
import { Alert } from "../ui/alert";
import { Button, buttonVariants } from "../ui/button";
import { Input } from "../ui/input";
import { PasswordInput } from "../ui/password-input";
import { Spinner } from "../ui/spinner";
import { PasswordChecklist } from "./password-checklist";

type Step = "email" | "reset" | "success";

export function ForgotPasswordFlow() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000,
    );

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError);

    if (nextEmailError) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await api.post<{ message: string }>(
        "/auth/forgot-password",
        { email: email.trim() },
      );
      setMessage(result.message);
      setCode("");
      setCodeError(null);
      setPassword("");
      setConfirmPassword("");
      setCooldown(30);
      setStep("reset");
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We could not start the reset. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function resendCode() {
    if (submitting || cooldown > 0) {
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const result = await api.post<{ message: string }>(
        "/auth/forgot-password",
        { email: email.trim() },
      );
      setMessage(result.message);
      setCooldown(30);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We could not resend the code. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextCodeError = validateVerificationCode(code);
    const nextPasswordError = validatePassword(password);
    const nextConfirmError = validateConfirmPassword(
      password,
      confirmPassword,
    );

    setCodeError(nextCodeError);
    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);

    if (nextCodeError || nextPasswordError || nextConfirmError) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await api.post<{ message: string }>(
        "/auth/confirm-forgot-password",
        {
          email: email.trim(),
          code,
          password,
        },
      );
      setMessage(result.message);
      setStep("success");
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We could not reset your password. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "success") {
    return (
      <div className="space-y-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 aria-hidden="true" className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Password reset complete
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {message ??
              "Your password has been updated. Sign in with your new password."}
          </p>
        </div>
        <Link
          href="/login"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Sign in with your new password
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className="space-y-5">
        <Alert variant="info">
          If an account exists for{" "}
          <span className="font-semibold">{email.trim()}</span>, a reset code
          has been sent. Enter it below with your new password.
        </Alert>

        <form className="space-y-4" onSubmit={resetPassword} noValidate>
          {formError ? <Alert variant="error">{formError}</Alert> : null}

          <Input
            label="Reset code"
            id="reset-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            required
            value={code}
            error={codeError ?? undefined}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
              if (codeError) setCodeError(null);
              if (formError) setFormError(null);
            }}
            className="text-center font-mono text-lg tracking-[0.45em]"
          />

          <div className="space-y-2">
            <PasswordInput
              label="New password"
              id="new-password"
              name="password"
              autoComplete="new-password"
              placeholder="Create a new password"
              icon={LockKeyhole}
              required
              value={password}
              error={passwordError ?? undefined}
              onChange={(event) => {
                setPassword(event.target.value);
                if (passwordError) setPasswordError(null);
              }}
            />
            <PasswordChecklist
              password={password}
              confirmation={confirmPassword}
              showConfirmation
            />
          </div>

          <PasswordInput
            label="Confirm new password"
            id="confirm-new-password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat your new password"
            icon={LockKeyhole}
            required
            value={confirmPassword}
            error={confirmError ?? undefined}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              if (confirmError) setConfirmError(null);
            }}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? <Spinner /> : <KeyRound aria-hidden="true" className="h-4 w-4" />}
            {submitting ? "Resetting password..." : "Reset password"}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2 text-sm text-slate-600">
          <button
            type="button"
            onClick={() => void resendCode()}
            disabled={submitting || cooldown > 0}
            className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-800 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
          </button>
          <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={requestCode} noValidate>
      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}

      <Input
        label="Email address"
        id="reset-email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        icon={Mail}
        hint="Use the email address on your account."
        required
        value={email}
        error={emailError ?? undefined}
        onChange={(event) => {
          setEmail(event.target.value);
          if (emailError) setEmailError(null);
          if (formError) setFormError(null);
        }}
      />

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? <Spinner /> : null}
        {submitting ? "Sending code..." : "Send reset code"}
        {!submitting ? (
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        ) : null}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
