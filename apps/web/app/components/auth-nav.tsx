"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import styles from "@/app/auth.module.css";

export function AuthNav() {
  const { user, loading, logout } = useAuth();

  return (
    <header className={styles.nav}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.brand}>
          Internship Project
        </Link>
        <nav className={styles.navActions}>
          {loading ? null : user ? (
            <>
              <span className={styles.userChip}>
                {user.name ?? user.email ?? user.username}
              </span>
              <Link href="/dashboard" className={styles.secondaryButton}>
                Dashboard
              </Link>
              <button
                type="button"
                className={styles.button}
                onClick={() => void logout()}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.secondaryButton}>
                Sign in
              </Link>
              <Link href="/signup" className={styles.button}>
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
