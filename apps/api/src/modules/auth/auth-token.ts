import type { Request } from 'express';

export function extractAccessToken(request: Request): string | undefined {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  if (type === 'Bearer' && token) {
    return token;
  }

  const cookies = request.cookies as Record<string, string> | undefined;
  return cookies?.access_token;
}
