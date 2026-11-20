"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  AtSign,
  BadgeCheck,
  Check,
  Cookie,
  Fingerprint,
  IdCard,
  KeyRound,
  LogOut,
  Mail,
  RefreshCw,
  Server,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { formatDisplayName, getInitials } from "@/lib/utils";
import { Alert } from "../ui/alert";
import { Button, buttonVariants } from "../ui/button";
import { Card } from "../ui/card";
import { Spinner } from "../ui/spinner";
import { ChangePasswordForm } from "./change-password-form";

function ProfileRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3.5 last:border-b-0">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        <Icon aria-hidden="true" className="h-4 w-4 text-slate-400" />
        {label}
      </span>
      <span
        className={
          mono
            ? "max-w-[60%] break-all text-right font-mono text-xs text-slate-800"
            : "max-w-[60%] break-words text-right text-sm font-medium text-slate-900"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function DashboardView() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await logout();
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <main id="main" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="animate-pulse space-y-6" aria-label="Loading dashboard">
            <div className="h-8 w-56 rounded-lg bg-slate-200" />
            <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-36 rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="h-96 rounded-2xl border border-slate-200 bg-white" />
              <div className="h-96 rounded-2xl border border-slate-200 bg-white" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main id="main" className="bg-slate-50">
        <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
          <Card className="p-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <ShieldCheck aria-hidden="true" className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-lg font-semibold text-slate-900">
              Session required
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Redirecting you to sign in so we can load your account.
            </p>
            <Link
              href="/login"
              className={buttonVariants({ className: "mt-5 w-full" })}
            >
              Go to sign in
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  const displayName = formatDisplayName(user);
  const initials = getInitials(displayName);
  const isVerified = user.email_verified === "true";

  return (
    <main id="main" className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-semibold text-white shadow-sm">
              {initials}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                Your workspace
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, {displayName}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Review your account, check how your session is protected, and
                keep your password up to date.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="#change-password"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <KeyRound aria-hidden="true" className="h-4 w-4" />
              Change password
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
            >
              {signingOut ? <Spinner /> : <LogOut aria-hidden="true" className="h-4 w-4" />}
              {signingOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <BadgeCheck aria-hidden="true" className="h-5 w-5" />
              </span>
              <span
                className={
                  isVerified
                    ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                    : "rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700"
                }
              >
                {isVerified ? "Verified" : "Check status"}
              </span>
            </div>
            <h2 className="mt-4 text-sm font-semibold text-slate-900">
              Account status
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {isVerified
                ? "Your email is confirmed and your account is active."
                : "Email verification status was not reported by the API."}
            </p>
          </Card>

          <Card className="p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Cookie aria-hidden="true" className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-sm font-semibold text-slate-900">
              Session security
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Tokens are held in HttpOnly cookies and never exposed to client
              JavaScript.
            </p>
          </Card>

          <Card className="p-5 sm:col-span-2 lg:col-span-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Fingerprint aria-hidden="true" className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-sm font-semibold text-slate-900">
              Identity provider
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your credentials and access tokens are managed by Amazon Cognito.
            </p>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Profile details
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Loaded securely from the protected{" "}
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
                    /auth/me
                  </code>{" "}
                  endpoint.
                </p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <IdCard aria-hidden="true" className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-5">
              <ProfileRow
                icon={UserRound}
                label="Name"
                value={user.name?.trim() || "Not provided"}
              />
              <ProfileRow
                icon={AtSign}
                label="Username"
                value={user.username ?? "Not available"}
              />
              <ProfileRow
                icon={Mail}
                label="Email"
                value={user.email ?? "Not available"}
              />
              <ProfileRow
                icon={BadgeCheck}
                label="Email verification"
                value={isVerified ? "Verified" : "Not verified"}
              />
              <ProfileRow
                icon={Fingerprint}
                label="Cognito user ID"
                value={user.sub ?? "Not available"}
                mono
              />
            </div>
          </Card>

          <Card id="change-password" className="scroll-mt-24 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Change password
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Confirm your current password, then choose a new one with at
                  least 8 characters.
                </p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <KeyRound aria-hidden="true" className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-5">
              <ChangePasswordForm />
            </div>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-900">
              How your session works
            </h2>
            <ul className="mt-4 space-y-3">
              {[
                {
                  icon: Cookie,
                  text: "Access and refresh tokens are stored in HttpOnly cookies.",
                },
                {
                  icon: RefreshCw,
                  text: "An expired access token is refreshed silently, then the request is retried.",
                },
                {
                  icon: Server,
                  text: "Protected API routes verify the Cognito token on the server before responding.",
                },
                {
                  icon: LogOut,
                  text: "Signing out clears your cookies and revokes the Cognito session.",
                },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <span className="leading-6">{text}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="flex flex-col justify-between p-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Account actions
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Update your password whenever you need to, or end this session
                when you are finished.
              </p>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Link
                href="#change-password"
                className={buttonVariants({ variant: "secondary" })}
              >
                <KeyRound aria-hidden="true" className="h-4 w-4" />
                Update password
              </Link>
              <Button
                variant="ghost"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
              >
                {signingOut ? <Spinner /> : <LogOut aria-hidden="true" className="h-4 w-4" />}
                {signingOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
              <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              Your session is active and protected by Amazon Cognito.
            </div>
          </Card>
        </div>

        {!isVerified ? (
          <div className="mt-5">
            <Alert variant="info" title="Verification status unavailable">
              The API did not report this account as verified. If you just
              created the account, confirm the email code before signing in
              again.
            </Alert>
          </div>
        ) : null}
      </div>
    </main>
  );
}
