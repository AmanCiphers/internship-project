const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function validateEmail(value: string): string | null {
  const email = value.trim();

  if (!email) {
    return "Enter your email address.";
  }

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address.";
  }

  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) {
    return "Enter a password.";
  }

  if (value.length < 8) {
    return "Use at least 8 characters.";
  }

  if (value.length > 256) {
    return "Password must be 256 characters or fewer.";
  }

  return null;
}

export function validateUsername(value: string): string | null {
  const username = value.trim();

  if (!username) {
    return "Choose a username.";
  }

  if (username.length < 3 || username.length > 128) {
    return "Username must be between 3 and 128 characters.";
  }

  if (!USERNAME_PATTERN.test(username)) {
    return "Use only letters, numbers, dots, underscores, and hyphens.";
  }

  return null;
}

export function validateVerificationCode(value: string): string | null {
  if (!/^\d{6}$/.test(value)) {
    return "Enter the 6-digit code from your email.";
  }

  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmation: string,
): string | null {
  if (!confirmation) {
    return "Confirm your password.";
  }

  if (password !== confirmation) {
    return "Passwords do not match.";
  }

  return null;
}

export function hasLength(value: string, minimum: number): boolean {
  return value.length >= minimum;
}
