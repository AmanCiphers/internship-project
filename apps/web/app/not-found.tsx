import Link from "next/link";
import { ArrowLeft, ShieldQuestion } from "lucide-react";
import { buttonVariants } from "./components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="bg-slate-50">
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <ShieldQuestion aria-hidden="true" className="h-7 w-7" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          404
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          This page could not be found
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
          The link may be outdated, or the page may have moved. Return to the
          homepage or sign in to continue from your dashboard.
        </p>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <Link href="/" className={buttonVariants()}>
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "secondary" })}
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
