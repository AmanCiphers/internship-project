"use client";

import { useState, type FormEvent } from "react";
import { KeyRound, LockKeyhole } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import {
  validateConfirmPassword,
  validatePassword,
} from "@/lib/validation";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { PasswordInput } from "../ui/password-input";
import { Spinner } from "../ui/spinner";
import { PasswordChecklist } from "../auth/password-checklist";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [newError, setNewError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setMessage(null);

    const nextCurrentError = currentPassword
      ? null
      : "Enter your current password.";
    const nextNewError = validatePassword(newPassword);
    const nextConfirmError = validateConfirmPassword(
      newPassword,
      confirmPassword,
    );

    setCurrentError(nextCurrentError);
    setNewError(nextNewError);
    setConfirmError(nextConfirmError);

    if (nextCurrentError || nextNewError || nextConfirmError) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await api.post<{ message: string }>(
        "/auth/change-password",
        {
          previousPassword: currentPassword,
          proposedPassword: newPassword,
        },
      );
      setMessage(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We could not update your password. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {message ? (
        <Alert variant="success" title="Password updated">
          {message} Your current session stays active.
        </Alert>
      ) : null}

      <PasswordInput
        label="Current password"
        id="current-password"
        name="currentPassword"
        autoComplete="current-password"
        placeholder="Enter your current password"
        icon={LockKeyhole}
        required
        value={currentPassword}
        error={currentError ?? undefined}
        onChange={(event) => {
          setCurrentPassword(event.target.value);
          if (currentError) setCurrentError(null);
          if (formError) setFormError(null);
        }}
      />

      <div className="space-y-2">
        <PasswordInput
          label="New password"
          id="new-password"
          name="newPassword"
          autoComplete="new-password"
          placeholder="Choose a new password"
          icon={KeyRound}
          required
          value={newPassword}
          error={newError ?? undefined}
          onChange={(event) => {
            setNewPassword(event.target.value);
            if (newError) setNewError(null);
          }}
        />
        <PasswordChecklist
          password={newPassword}
          confirmation={confirmPassword}
          showConfirmation
        />
      </div>

      <PasswordInput
        label="Confirm new password"
        id="confirm-password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Repeat your new password"
        icon={KeyRound}
        required
        value={confirmPassword}
        error={confirmError ?? undefined}
        onChange={(event) => {
          setConfirmPassword(event.target.value);
          if (confirmError) setConfirmError(null);
        }}
      />

      <Button type="submit" disabled={submitting}>
        {submitting ? <Spinner /> : <KeyRound aria-hidden="true" className="h-4 w-4" />}
        {submitting ? "Updating password..." : "Update password"}
      </Button>
    </form>
  );
}
