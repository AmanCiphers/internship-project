"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import styles from "../auth.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [previousPassword, setPreviousPassword] = useState("");
  const [proposedPassword, setProposedPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      const result = await api.post<{ message: string }>(
        "/auth/change-password",
        { previousPassword, proposedPassword },
      );
      setMessage(result.message);
      setPreviousPassword("");
      setProposedPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.subtitle}>Loading your session...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className={styles.page}>
      <div className={styles.wideCard}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          This page calls the protected <code>/auth/me</code> endpoint.
        </p>

        <div className={styles.profile}>
          <div className={styles.profileRow}>
            <span className={styles.profileLabel}>Username</span>
            <span>{user.username ?? "—"}</span>
          </div>
          <div className={styles.profileRow}>
            <span className={styles.profileLabel}>Name</span>
            <span>{user.name ?? "—"}</span>
          </div>
          <div className={styles.profileRow}>
            <span className={styles.profileLabel}>Email</span>
            <span>{user.email ?? "—"}</span>
          </div>
          <div className={styles.profileRow}>
            <span className={styles.profileLabel}>User ID</span>
            <span>{user.sub ?? "—"}</span>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Change password</h2>
        <form className={styles.form} onSubmit={handleChangePassword}>
          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="previousPassword">
              Current password
            </label>
            <input
              className={styles.input}
              id="previousPassword"
              type="password"
              autoComplete="current-password"
              required
              value={previousPassword}
              onChange={(event) => setPreviousPassword(event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="proposedPassword">
              New password
            </label>
            <input
              className={styles.input}
              id="proposedPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={proposedPassword}
              onChange={(event) => setProposedPassword(event.target.value)}
            />
          </div>

          <button
            className={styles.button}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>

        <div className={styles.actions} style={{ marginTop: 24 }}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              void logout().then(() => router.push("/login"));
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
