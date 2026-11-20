export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function getInitials(value?: string): string {
  if (!value) {
    return "?";
  }

  const parts = value
    .replace(/@.*$/, "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return value.slice(0, 1).toUpperCase();
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function formatDisplayName(user: {
  name?: string;
  email?: string;
  username?: string;
}): string {
  return user.name?.trim() || user.email || user.username || "Your account";
}
