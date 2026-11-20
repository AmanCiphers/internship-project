"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Mail,
  MailCheck,
  UserRound,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateUsername,
  validateVerificationCode,
} from "@/lib/validation";
import { Alert } from "../ui/alert";
import { Button, buttonVariants } from "../ui/button";
import { Input } from "../ui/input";
import { PasswordInput } from "../ui/password-input";
import { Spinner } from "../ui/spinner";
import { PasswordChecklist } from "./password-checklist";

type Step = "details" | "verify" | "success";

type FieldErrors = Partial<
  Record<"username" | "email" | "password" | "confirmPassword", string>
>;

export function SignupFlow() {
  const [step, setStep] = useState<Step>("details");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [codeError, setCodeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
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

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setMessage(null);

    const nextErrors: FieldErrors = {
      username: validateUsername(username) ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirmPassword:
        validateConfirmPassword(password, confirmPassword) ?? undefined,
    };

    const hasErrors = Object.values(nextErrors).some(Boolean);
    setFieldErrors(nextErrors);

    if (hasErrors) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await api.post<{
        message: string;
        userConfirmed?: boolean;
      }>("/auth/signup", {
        username: username.trim(),
        email: email.trim(),
        password,
        name: name.trim() || undefined,
      });

      if (result.userConfirmed) {
        setMessage(result.message);
        setStep("success");
        return;
      }

      setMessage(result.message);
      setCode("");
      setCodeError(null);
      setCooldown(30);
      setStep("verify");
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We could not create your account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextCodeError = validateVerificationCode(code);
    setCodeError(nextCodeError);

    if (nextCodeError) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await api.post<{ message: string }>("/auth/confirm", {
        username: username.trim(),
        code,
      });
      setMessage(result.message);
      setStep("success");
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We could not verify that code. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (resending || cooldown > 0) {
      return;
    }

    setResending(true);
    setFormError(null);

    try {
      const result = await api.post<{ message: string }>("/auth/resend-code", {
        username: username.trim(),
      });
      setMessage(result.message);
      setCooldown(30);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We could not resend the code. Please try again.",
      );
    } finally {
      setResending(false);
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
            Your email is verified
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {message ??
              "Your account is ready. Sign in with your email and password to open the dashboard."}
          </p>
        </div>
        <Link
          href="/login"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Continue to sign in
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
              <MailCheck aria-hidden="true" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Check your inbox
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                We sent a six-digit code to{" "}
                <span className="font-semibold text-slate-900">
                  {email.trim()}
                </span>
                . The code expires, so request a new one if needed.
              </p>
            </div>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleVerify} noValidate>
          {formError ? <Alert variant="error">{formError}</Alert> : null}
          {message ? <Alert variant="success">{message}</Alert> : null}

          <Input
            label="Verification code"
            id="code"
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

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? <Spinner /> : <KeyRound aria-hidden="true" className="h-4 w-4" />}
            {submitting ? "Verifying..." : "Verify email"}
          </Button>
        </form>

        <div className="text-center text-sm text-slate-600">
          Did not receive the code?{" "}
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={resending || cooldown > 0}
            className="font-semibold text-brand-700 hover:text-brand-800 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {resending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend it"}
          </button>
        </div>

        <p className="text-center text-xs leading-5 text-slate-500">
          Tip: check your spam or promotions folder. If the address is wrong,
          you can create a new account with the correct email.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleDetailsSubmit} noValidate>
      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Username"
          id="username"
          name="username"
          autoComplete="username"
          placeholder="jane.doe"
          icon={UserRound}
          required
          value={username}
          error={fieldErrors.username}
          hint="Letters, numbers, dots, underscores, hyphens."
          onChange={(event) => {
            setUsername(event.target.value);
            if (fieldErrors.username) {
              setFieldErrors((current) => ({
                ...current,
                username: undefined,
              }));
            }
          }}
        />

        <Input
          label="Name"
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Jane Doe"
          hint="Optional — shown on your dashboard."
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

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
        error={fieldErrors.email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (fieldErrors.email) {
            setFieldErrors((current) => ({ ...current, email: undefined }));
          }
        }}
      />

      <div className="space-y-2">
        <PasswordInput
          label="Password"
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a password"
          icon={LockKeyhole}
          required
          value={password}
          error={fieldErrors.password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (fieldErrors.password) {
              setFieldErrors((current) => ({
                ...current,
                password: undefined,
              }));
            }
          }}
        />
        <PasswordChecklist
          password={password}
          confirmation={confirmPassword}
          showConfirmation
        />
      </div>

      <PasswordInput
        label="Confirm password"
        id="confirmPassword"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Repeat your password"
        icon={LockKeyhole}
        required
        value={confirmPassword}
        error={fieldErrors.confirmPassword}
        onChange={(event) => {
          setConfirmPassword(event.target.value);
          if (fieldErrors.confirmPassword) {
            setFieldErrors((current) => ({
              ...current,
              confirmPassword: undefined,
            }));
          }
        }}
      />

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? <Spinner /> : null}
        {submitting ? "Creating account..." : "Create account"}
        {!submitting ? (
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        ) : null}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Already registered?{" "}
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
