"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import styles from "./auth.module.css";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className={styles.hero}>
      <div className={styles.heroInner}>
        <h1 className={styles.heroTitle}>
          Full-stack authentication, powered by Cognito
        </h1>
        <p className={styles.heroText}>
          Create an account, verify your email, sign in, and call protected API
          routes. Tokens are kept in httpOnly cookies and never exposed to
          JavaScript.
        </p>
        <div className={styles.actions}>
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className={styles.button}>
                Go to dashboard
              </Link>
              <span className={styles.userChip}>
                Signed in as {user.email ?? user.username}
              </span>
            </>
          ) : (
            <>
              <Link href="/signup" className={styles.button}>
                Create account
              </Link>
              <Link href="/login" className={styles.secondaryButton}>
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
