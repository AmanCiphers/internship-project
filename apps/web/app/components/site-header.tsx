"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn, formatDisplayName, getInitials } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Logo } from "./logo";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#security", label: "Security" },
];

export function SiteHeader() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const displayName = user ? formatDisplayName(user) : "";
  const initials = getInitials(displayName);

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await logout();
      setMenuOpen(false);
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            aria-label="Internship Project home"
            className="flex shrink-0 items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <Logo />
          </Link>

          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {loading ? (
            <span
              aria-hidden="true"
              className="h-9 w-36 animate-pulse rounded-xl bg-slate-100"
            />
          ) : user ? (
            <>
              <span className="flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {initials}
                </span>
                <span className="max-w-[9rem] truncate text-xs font-medium text-slate-700">
                  {displayName}
                </span>
              </span>
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                {signingOut ? (
                  <Spinner />
                ) : (
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                )}
                <span className="sr-only sm:not-sr-only">
                  {signingOut ? "Signing out" : "Sign out"}
                </span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                Create account
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className={buttonVariants({
            variant: "secondary",
            size: "icon",
            className: "lg:hidden",
          })}
        >
          {menuOpen ? (
            <X aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={cn(
          "border-t border-slate-200 bg-white lg:hidden",
          menuOpen ? "block" : "hidden",
        )}
      >
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6">
          <nav aria-label="Mobile navigation">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-slate-200 pt-5">
            {loading ? (
              <span
                aria-hidden="true"
                className="block h-11 w-full animate-pulse rounded-xl bg-slate-100"
              />
            ) : user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {displayName}
                    </p>
                    {user.email ? (
                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={buttonVariants({
                    variant: "secondary",
                    className: "w-full",
                  })}
                >
                  <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  disabled={signingOut}
                  className={buttonVariants({
                    variant: "ghost",
                    className: "w-full",
                  })}
                >
                  {signingOut ? <Spinner /> : <LogOut aria-hidden="true" className="h-4 w-4" />}
                  {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            ) : (
              <div className="grid gap-2">
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className={buttonVariants({ className: "w-full" })}
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className={buttonVariants({
                    variant: "secondary",
                    className: "w-full",
                  })}
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
