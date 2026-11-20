import type { ReactNode } from "react";
import {
  Check,
  Cookie,
  Fingerprint,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "./logo";

const sidePoints = [
  {
    icon: MailCheck,
    title: "Verified accounts",
    description: "A six-digit email code confirms every new account.",
  },
  {
    icon: Cookie,
    title: "HttpOnly sessions",
    description: "Tokens stay in secure cookies, out of client JavaScript.",
  },
  {
    icon: Fingerprint,
    title: "Cognito identities",
    description: "Credentials and tokens are managed by Amazon Cognito.",
  },
];

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main id="main" className="bg-slate-50">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:items-stretch lg:gap-10 lg:py-16">
        <aside className="relative hidden overflow-hidden rounded-3xl bg-slate-950 p-9 text-white lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="absolute inset-0 bg-grid-dark opacity-40" />
          <div
            aria-hidden="true"
            className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-600/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
          />

          <div className="relative">
            <Logo tone="inverse" />
            <h2 className="mt-12 text-3xl font-semibold leading-tight tracking-tight">
              Secure access,
              <span className="block text-brand-300">without the friction.</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              One account unlocks the dashboard and protected API routes. Every
              step is built on the existing NestJS and Cognito integration.
            </p>

            <ul className="mt-9 space-y-5">
              {sidePoints.map(({ icon: Icon, title: pointTitle, description: pointDescription }) => (
                <li key={pointTitle} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-brand-300">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {pointTitle}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-400">
                      {pointDescription}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-10 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-white">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-300" />
                Session protection
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                <Check aria-hidden="true" className="h-3 w-3" />
                Active
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-black/20 px-2.5 py-2">
                <dt className="text-slate-400">Transport</dt>
                <dd className="mt-0.5 font-medium text-slate-200">
                  HttpOnly cookie
                </dd>
              </div>
              <div className="rounded-lg bg-black/20 px-2.5 py-2">
                <dt className="text-slate-400">Verification</dt>
                <dd className="mt-0.5 font-medium text-slate-200">Email code</dd>
              </div>
            </dl>
          </div>
        </aside>

        <section className="flex w-full items-center">
          <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

            <div className="mt-7">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
