"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { formatDisplayName } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export function HeroActions() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div aria-hidden="true" className="flex flex-wrap gap-3">
        <span className="h-12 w-48 animate-pulse rounded-xl bg-slate-200" />
        <span className="h-12 w-32 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/dashboard"
          className={buttonVariants({ size: "lg", className: "group" })}
        >
          <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
          Go to your dashboard
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
        <p className="text-sm text-slate-600">
          Signed in as{" "}
          <span className="font-semibold text-slate-900">
            {formatDisplayName(user)}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Link
        href="/signup"
        className={buttonVariants({ size: "lg", className: "group" })}
      >
        Create your account
        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
      <Link
        href="/login"
        className={buttonVariants({ variant: "secondary", size: "lg" })}
      >
        Sign in
      </Link>
      <p className="text-sm text-slate-500 sm:ml-1">
        Verify by email in under a minute.
      </p>
    </div>
  );
}
