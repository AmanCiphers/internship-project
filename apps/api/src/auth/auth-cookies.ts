import type { Response } from 'express';
import type { CognitoTokens } from './cognito.service.js';

const isProduction = process.env.NODE_ENV === 'production';
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
};

const COOKIE_NAMES = [
  'access_token',
  'id_token',
  'refresh_token',
  'auth_email',
] as const;

export function setAuthCookies(
  response: Response,
  tokens: CognitoTokens,
  email: string,
): void {
  const accessMaxAge = (tokens.expiresIn ?? 3600) * 1000;

  response.cookie('access_token', tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: accessMaxAge,
  });

  if (tokens.idToken) {
    response.cookie('id_token', tokens.idToken, {
      ...COOKIE_OPTIONS,
      maxAge: accessMaxAge,
    });
  }

  if (tokens.refreshToken) {
    response.cookie('refresh_token', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }

  response.cookie('auth_email', email, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookies(response: Response): void {
  for (const name of COOKIE_NAMES) {
    response.clearCookie(name, COOKIE_OPTIONS);
  }
}
