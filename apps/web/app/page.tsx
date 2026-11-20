import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Cookie,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  MailCheck,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { HeroActions } from "./components/hero-actions";
import { SectionHeading } from "./components/section-heading";
import { buttonVariants } from "./components/ui/button";

const capabilities = [
  {
    icon: MailCheck,
    title: "Email verification",
    description: "Every account is confirmed with a six-digit code.",
  },
  {
    icon: Cookie,
    title: "HttpOnly sessions",
    description: "Token material never reaches client-side JavaScript.",
  },
  {
    icon: RefreshCw,
    title: "Silent refresh",
    description: "Expired access tokens renew without interrupting you.",
  },
  {
    icon: Fingerprint,
    title: "Cognito identities",
    description: "Credentials are managed by Amazon Cognito.",
  },
];

const features = [
  {
    icon: UserPlus,
    title: "A clear sign-up path",
    description:
      "Choose a username, add your email, and set a password with inline guidance at every step.",
  },
  {
    icon: MailCheck,
    title: "Verified from day one",
    description:
      "Accounts stay locked until the email verification code is confirmed. Codes can be resent if needed.",
  },
  {
    icon: LockKeyhole,
    title: "Secure by default",
    description:
      "Access and refresh tokens live in HttpOnly cookies, protected from JavaScript and stored outside localStorage.",
  },
  {
    icon: Server,
    title: "Server-verified access",
    description:
      "Protected API routes validate the Cognito access token on the server before returning account data.",
  },
  {
    icon: RefreshCw,
    title: "Sessions that keep up",
    description:
      "The frontend quietly refreshes an expired access token and retries the request, so you stay signed in.",
  },
  {
    icon: KeyRound,
    title: "Password control",
    description:
      "Change your password from the dashboard, or recover access with a verified email reset code.",
  },
];

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create your account",
    description:
      "Pick a username, enter your email, and choose a password. The form validates each field before anything is sent.",
  },
  {
    number: "02",
    icon: MailCheck,
    title: "Verify your email",
    description:
      "Cognito sends a six-digit code. Enter it once to activate the account, or request a fresh code if it expires.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Sign in and continue",
    description:
      "Your session is set as secure cookies, the dashboard loads your profile, and protected API calls are ready to use.",
  },
];

const securityPoints = [
  "Cognito tokens are stored in HttpOnly cookies, never localStorage.",
  "Cookies use SameSite=Lax and become Secure in production.",
  "Every protected request is verified with the Cognito JWT verifier.",
  "CORS allows one configured origin and credentialed requests.",
  "Logout clears cookies and revokes the Cognito session.",
];

export default function Home() {
  return (
    <main id="main">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              Cognito-powered authentication
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Sign-in that feels simple.
              <span className="block text-brand-600">
                Security that runs deep.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              A complete authentication experience for modern web apps:
              verified accounts, secure cookie sessions, protected routes, and
              password management — all wired to Amazon Cognito.
            </p>

            <div className="mt-8">
              <HeroActions />
            </div>

            <ul className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              {[
                "Verified email required",
                "HttpOnly cookie sessions",
                "Protected dashboard included",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check aria-hidden="true" className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand-100 via-white to-emerald-50 blur-2xl"
            />

            <div className="relative rounded-3xl border border-slate-200 bg-white p-2 shadow-lift">
              <div className="rounded-[1.35rem] border border-slate-100 bg-slate-50/80 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                      <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Account security
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Session overview
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Preview
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white">
                      IP
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        Your account
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        Cognito user pool
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                      <BadgeCheck aria-hidden="true" className="h-3 w-3" />
                      Verified
                    </span>
                  </div>

                  <dl className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-xs">
                    {[
                      ["Session", "HttpOnly cookie"],
                      ["Access token", "Server verified"],
                      ["Refresh", "Automatic"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3"
                      >
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Check
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-emerald-600"
                          />
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-slate-900 px-3.5 py-3 text-white">
                  <span className="flex items-center gap-2 text-xs font-medium">
                    <LockKeyhole
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-brand-300"
                    />
                    Protected API route
                  </span>
                  <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                    Authorized
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 bottom-10 hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-soft sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <MailCheck aria-hidden="true" className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-medium text-slate-700">
                Email verified
              </span>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Authentication capabilities" className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-px overflow-hidden border-x border-slate-200 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-3 border-b border-slate-200 py-6 sm:border-r sm:px-6 lg:border-b-0"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Everything included"
            title="A complete account experience, not just a login form"
            description="Each screen is built around the real authentication API, with clear feedback for loading, success, and failure states."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How it works"
            title="From first visit to a protected dashboard in three steps"
            description="No setup maze. The flow mirrors exactly what the backend and Cognito already support."
          />

          <ol className="mt-12 grid gap-5 lg:grid-cols-3">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <li
                key={number}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-300">
                    {number}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              Sign in
            </Link>
            {" · "}
            Forgot your password?{" "}
            <Link
              href="/forgot-password"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              Reset it with an email code
            </Link>
          </p>
        </div>
      </section>

      <section id="security" className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
        <div aria-hidden="true" className="absolute inset-0 bg-grid-dark opacity-40" />
        <div
          aria-hidden="true"
          className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
              Security by design
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your session is protected at every layer
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Authentication is handled by Amazon Cognito and verified by the
              NestJS API. The browser holds only opaque, HttpOnly cookies — no
              token is exposed to client-side JavaScript.
            </p>

            <ul className="mt-8 space-y-3">
              {securityPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <Check aria-hidden="true" className="h-3 w-3" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur">
            <div className="rounded-[1.35rem] border border-white/10 bg-slate-900/80 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck aria-hidden="true" className="h-4 w-4 text-brand-300" />
                  Cookie policy
                </div>
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                  Active
                </span>
              </div>

              <dl className="mt-5 space-y-3 font-mono text-xs">
                {[
                  ["access_token", "HttpOnly · SameSite=Lax"],
                  ["refresh_token", "HttpOnly · 30 days"],
                  ["auth_email", "HttpOnly · refresh hint"],
                  ["id_token", "HttpOnly · unused by client"],
                ].map(([name, detail]) => (
                  <div
                    key={name}
                    className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <dt className="text-brand-200">{name}</dt>
                    <dd className="text-slate-400">{detail}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs leading-5 text-slate-300">
                <Cookie aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                Tokens are set by the API. The frontend calls protected routes
                with <span className="font-mono text-white">credentials: &quot;include&quot;</span>.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-12 text-center shadow-lift sm:px-12 sm:py-16">
            <div aria-hidden="true" className="absolute inset-0 bg-grid-dark opacity-20" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Ready to see the full experience?
              </h2>
              <p className="mt-4 text-base leading-7 text-brand-100">
                Create an account, verify your email, and explore the protected
                dashboard. Everything runs on the existing NestJS and Cognito
                backend.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "lg",
                    className:
                      "group border-transparent bg-white text-brand-700 hover:bg-brand-50",
                  })}
                >
                  Create your account
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "lg",
                    className:
                      "border border-white/25 text-white hover:bg-white/10 hover:text-white",
                  })}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
