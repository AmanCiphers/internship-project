"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/api";
import styles from "../auth.module.css";

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "confirm">("details");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      const result = await api.post<{ message: string }>("/auth/signup", {
        username,
        email,
        password,
        name: name || undefined,
      });
      setMessage(result.message);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      await api.post("/auth/confirm", { username, code });
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setMessage(null);

    try {
      const result = await api.post<{ message: string }>("/auth/resend-code", {
        username,
      });
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  if (step === "confirm") {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Verify your email</h1>
          <p className={styles.subtitle}>
            Enter the 6-digit code sent to {email}.
          </p>

          <form className={styles.form} onSubmit={handleConfirm}>
            {error ? <p className={styles.error}>{error}</p> : null}
            {message ? <p className={styles.success}>{message}</p> : null}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="code">
                Verification code
              </label>
              <input
                className={styles.input}
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>

            <button
              className={styles.button}
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <p className={styles.muted}>
            Did not receive a code?{" "}
            <button
              type="button"
              className={styles.link}
              onClick={() => void handleResend()}
            >
              Resend it
            </button>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          We will email you a code to verify your address.
        </p>

        <form className={styles.form} onSubmit={handleSignUp}>
          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              Username
            </label>
            <input
              className={styles.input}
              id="username"
              autoComplete="username"
              required
              minLength={3}
              maxLength={128}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Name (optional)
            </label>
            <input
              className={styles.input}
              id="name"
              autoComplete="name"
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              className={styles.input}
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              className={styles.input}
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button
            className={styles.button}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className={styles.muted}>
          Already registered?{" "}
          <Link href="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
