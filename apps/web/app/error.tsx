"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CircleAlert, RefreshCw } from "lucide-react";
import { buttonVariants } from "./components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="bg-slate-50">
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <CircleAlert aria-hidden="true" className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
          An unexpected error interrupted this page. Try again, or return to the
          homepage if the problem continues.
        </p>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={reset} className={buttonVariants()}>
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className={buttonVariants({ variant: "secondary" })}
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
