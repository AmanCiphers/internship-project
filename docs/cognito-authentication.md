# Cognito Authentication — Full Implementation Record

This document records everything done to add Amazon Cognito authentication to the
monorepo: the AWS configuration, backend auth module, frontend integration, token
and cookie strategy, the exact API contract, every command used to verify it, every
problem encountered along the way, and the remaining limitations.

> Status: working end-to-end. Backend and frontend build and lint cleanly.
> No commits were made; all changes exist in the working tree.

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [Implementation history](#2-implementation-history)
3. [Architecture](#3-architecture)
4. [AWS Cognito configuration](#4-aws-cognito-configuration)
5. [Environment variables](#5-environment-variables)
6. [Dependencies installed](#6-dependencies-installed)
7. [Files created and modified](#7-files-created-and-modified)
8. [Backend: file-by-file](#8-backend-file-by-file)
9. [Backend: API reference](#9-backend-api-reference)
10. [Authentication flows step by step](#10-authentication-flows-step-by-step)
11. [Token and cookie strategy](#11-token-and-cookie-strategy)
12. [Error mapping](#12-error-mapping)
13. [Frontend: file-by-file](#13-frontend-file-by-file)
14. [Frontend user journeys](#14-frontend-user-journeys)
15. [Running the project](#15-running-the-project)
16. [Testing with curl](#16-testing-with-curl)
17. [Verification performed](#17-verification-performed)
18. [Problems encountered and fixes](#18-problems-encountered-and-fixes)
19. [Security notes](#19-security-notes)
20. [Known limitations and future work](#20-known-limitations-and-future-work)
21. [Command and file reference](#21-command-and-file-reference)

---

## 1. Executive summary

The app now supports:

- Sign-up with **username + email + password**, followed by email verification
- Resend verification code
- Login with **email (Cognito email alias) + password**
- Stateless session validation on every protected request
- Silent access-token refresh using a refresh token
- Logout (global sign-out) and cookie cleanup
- Password reset (forgot password + confirm forgot password)
- Change password while authenticated
- Profile retrieval (`/auth/me`)
- A Next.js frontend with signup, confirmation, login, dashboard, change password,
  logout, and auth-aware navigation

Key design decision: **Cognito tokens are never sent to the browser in JSON and are
never stored in localStorage**. The backend sets them as `HttpOnly` cookies. The
browser automatically sends them to the API; JavaScript cannot read them.

```
Browser (Next.js :3000)
   │  fetch(..., { credentials: "include" })
   ▼
NestJS API (:4000)  ── AWS SDK ──▶  Amazon Cognito user pool
   │
   ├─ sets/clears HttpOnly cookies (access, id, refresh)
   └─ verifies access token with aws-jwt-verify
```

---

## 2. Implementation history

This section captures the sequence of decisions, including the false starts.

1. **First implementation attempt.** A Cognito auth module was added to the NestJS
   API with signup, confirm, login, refresh, logout, profile, password reset, and
   change password. Tokens were returned in the JSON response body.
2. **Everything was reverted** at the user's request. The working tree was restored
   with `git restore`, new directories were deleted, and `npm install` pruned the
   temporary dependencies.
3. **User pool was created in AWS and env vars were set.** The module was
   re-implemented against those values.
4. **Signup failed** with `InvalidParameterException: Username cannot be of email
   format, since user pool is configured for email alias`. The pool has **email as
   an alias**, so the Cognito username must not be an email address. A required
   `username` field was added to signup, confirm, and resend.
5. **Login failed** with `InvalidParameterException: USER_PASSWORD_AUTH flow not
   enabled for this client`. The backend uses `USER_PASSWORD_AUTH`, which must be
   enabled on the app client. The error mapping was improved to report this clearly.
   The flow was enabled in the Cognito console.
6. **Frontend integration.** Next.js pages were added.
7. **Session security upgrade.** Tokens moved from JSON responses to `HttpOnly`
   cookies; the guard was extended to accept tokens from cookies; CORS was changed
   to allow credentials.
8. **Dev-server hiccup.** `next dev` failed once immediately after `next build`.
   The dev server was started successfully afterward and all routes returned 200.

---

## 3. Architecture

### Runtime topology

```
┌──────────────────────────┐         ┌──────────────────────────┐
│  Next.js web :3000       │         │  AWS Cognito user pool   │
│  - login/signup pages    │         │  - email alias sign-in   │
│  - dashboard             │         │  - client secret         │
│  - AuthProvider          │         │  - USER_PASSWORD_AUTH    │
└───────────┬──────────────┘         └────────────▲─────────────┘
            │  HTTPS + cookies                     │ AWS SDK (SigV4)
            ▼                                      │
┌──────────────────────────────────────────────────┴─────────────┐
│  NestJS API :4000                                               │
│  AuthController → AuthService → CognitoService → AWS           │
│  CognitoAuthGuard (aws-jwt-verify) protects secured routes     │
└─────────────────────────────────────────────────────────────────┘
```

### Trust boundaries

- The **frontend** is untrusted from the API's perspective. It has no token access.
  It calls the API with `credentials: "include"`.
- The **API** holds AWS credentials through the standard AWS credential chain and
  is the only component that talks to Cognito.
- The **app client secret** lives only in the backend `.env`; it is used to compute
  `SECRET_HASH` for every Cognito call.
- **Cognito** issues all tokens. The API verifies access tokens locally
  (`aws-jwt-verify`) without calling Cognito per request.

---

## 4. AWS Cognito configuration

### User pool

- Sign-in identifier: **email alias enabled**
  - A user has a distinct `username` which must **not** look like an email address.
  - `email` is an alias attribute and can be used to sign in.
- Email verification: Cognito sends a 6-digit code.
- Password policy: enforced by Cognito; the API additionally validates a minimum
  length of 8 characters.

### App client

- Confidential client with a **client secret** (`COGNITO_CLIENT_SECRET` is set).
- Required authentication flow: **`ALLOW_USER_PASSWORD_AUTH`**
  - Console label: **“Sign in with username and password”** (older UI: “Enable
    username password based authentication”).
  - Without this flow, `InitiateAuth` fails with
    `InvalidParameterException: USER_PASSWORD_AUTH flow not enabled for this client`.
- `ALLOW_REFRESH_TOKEN_AUTH` is also required for refresh-token flow.
- Client secret means every relevant Cognito call must include `SECRET_HASH`, which
  the backend computes automatically.

### Where to enable the flow (current console)

1. Open <https://console.aws.amazon.com/cognito/v2/idp/user-pools>.
2. Select the user pool.
3. **Applications → App clients** (older console: **App integration → App clients**).
4. Open the app client.
5. **App client information → Edit**.
6. **App client flows / Authentication flows** → enable
   “Sign in with username and password” (`ALLOW_USER_PASSWORD_AUTH`).
7. Save.

### IAM permissions used by the API credentials

The backend signs requests with ambient AWS credentials. The identity needs:

```
cognito-idp:SignUp
cognito-idp:ConfirmSignUp
cognito-idp:ResendConfirmationCode
cognito-idp:InitiateAuth
cognito-idp:GlobalSignOut
cognito-idp:ForgotPassword
cognito-idp:ConfirmForgotPassword
cognito-idp:GetUser
cognito-idp:ChangePassword
```

No AWS CLI is installed in this environment. The SDK resolves credentials through
its normal provider chain (env vars, shared config, container/instance role, etc.).
Nothing sensitive was added to the repository.

---

## 5. Environment variables

Located at `apps/api/.env` (ignored by git):

| Variable | Required | Purpose |
| --- | --- | --- |
| `AWS_REGION` | yes | Region of the user pool |
| `COGNITO_USER_POOL_ID` | yes | User pool ID |
| `COGNITO_CLIENT_ID` | yes | App client ID |
| `COGNITO_CLIENT_SECRET` | yes here | Client secret; enables `SECRET_HASH` |
| `FRONTEND_URL` | no | CORS origin; defaults to `http://localhost:3000` |
| `PORT` | no | API port; defaults to `4000` |

The `.env` file is loaded by `@nestjs/config` (`ConfigModule.forRoot({ isGlobal:
true })`). In production, prefer real secret management rather than a file.

Frontend optional variable:

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | API base URL used by `lib/api.ts` |

If frontend and API are deployed to **different sites** (not just different ports),
cookie settings must change; see [Security notes](#19-security-notes).

---

## 6. Dependencies installed

### `apps/api`

Runtime:

| Package | Reason |
| --- | --- |
| `@aws-sdk/client-cognito-identity-provider` | Cognito calls |
| `aws-jwt-verify` | Local access-token verification |
| `class-validator` | DTO validation |
| `class-transformer` | DTO transformation (global `ValidationPipe`) |
| `@nestjs/config` | Loads `.env` |
| `cookie-parser` | Parses cookies in the guard/controller |

Dev:

| Package | Reason |
| --- | --- |
| `@types/cookie-parser` | Types for `req.cookies` |

Installed with:

```bash
npm install -w @project/api @aws-sdk/client-cognito-identity-provider \
  aws-jwt-verify class-validator class-transformer @nestjs/config cookie-parser
npm install -w @project/api -D @types/cookie-parser
```

### `apps/web`

No new packages. Uses the existing Next.js 16.4.3 / React 19.3 setup and native
`fetch`.

---

## 7. Files created and modified

### Backend — new files

```
apps/api/src/config/env.ts
apps/api/src/auth/auth.module.ts
apps/api/src/auth/auth.controller.ts
apps/api/src/auth/auth.service.ts
apps/api/src/auth/cognito.service.ts
apps/api/src/auth/auth-cookies.ts
apps/api/src/auth/auth-token.ts
apps/api/src/auth/guards/cognito-auth.guard.ts
apps/api/src/auth/decorators/current-user.decorator.ts
apps/api/src/auth/dto/sign-up.dto.ts
apps/api/src/auth/dto/login.dto.ts
apps/api/src/auth/dto/confirm-sign-up.dto.ts
apps/api/src/auth/dto/resend-confirmation.dto.ts
apps/api/src/auth/dto/refresh-token.dto.ts
apps/api/src/auth/dto/forgot-password.dto.ts
apps/api/src/auth/dto/confirm-forgot-password.dto.ts
apps/api/src/auth/dto/change-password.dto.ts
```

### Backend — modified files

```
apps/api/src/app.module.ts     # ConfigModule + AuthModule
apps/api/src/main.ts           # cookie-parser, credentialed CORS, ValidationPipe
apps/api/package.json          # dependencies
package-lock.json              # dependency lockfile
```

### Frontend — new files

```
apps/web/lib/api.ts
apps/web/lib/auth-context.tsx
apps/web/app/auth.module.css
apps/web/app/components/auth-nav.tsx
apps/web/app/login/page.tsx
apps/web/app/signup/page.tsx
apps/web/app/dashboard/page.tsx
```

### Frontend — modified files

```
apps/web/app/layout.tsx        # AuthProvider + AuthNav, metadata
apps/web/app/page.tsx          # auth-aware landing page
```

### Not changed

- `apps/admin` — untouched.
- Database/Prisma — untouched; auth is entirely Cognito-backed.
- `apps/web/next.config.ts` — untouched (`cacheComponents` and
  `partialPrefetching` remain enabled).

---

## 8. Backend: file-by-file

### `src/config/env.ts`

Small helpers used everywhere config is read:

```ts
requireEnv(name)   // returns value or throws "Missing required environment variable"
optionalEnv(name)  // returns value or undefined
```

Reading env lazily (inside getters/methods) means the app can boot, and the existing
non-auth test can run, even when Cognito credentials are absent.

### `src/auth/cognito.service.ts`

Thin wrapper around `CognitoIdentityProviderClient`. Responsibilities:

- Lazily creates the SDK client with `AWS_REGION`.
- Computes `SECRET_HASH` when a client secret exists:
  `Base64(HMAC-SHA256(clientSecret, username + clientId))`.
- Normalizes token responses into `CognitoTokens`.
- Exposes one method per Cognito operation:

| Method | Cognito command | Notes |
| --- | --- | --- |
| `signUp` | `SignUpCommand` | Username, password, `email` attribute, optional `name` |
| `confirmSignUp` | `ConfirmSignUpCommand` | Username + code |
| `resendConfirmationCode` | `ResendConfirmationCodeCommand` | Username |
| `login` | `InitiateAuthCommand` | `USER_PASSWORD_AUTH` |
| `refreshTokens` | `InitiateAuthCommand` | `REFRESH_TOKEN_AUTH` |
| `logout` | `GlobalSignOutCommand` | Revokes refresh tokens for all devices |
| `forgotPassword` | `ForgotPasswordCommand` | Sends reset code |
| `confirmForgotPassword` | `ConfirmForgotPasswordCommand` | Email + code + new password |
| `changePassword` | `ChangePasswordCommand` | Uses access token |
| `getUser` | `GetUserCommand` | Flattens attributes; used by `/auth/me` and login |

`toTokens` throws a `500` if Cognito returns no access token.

### `src/auth/auth.service.ts`

Business layer. Takes DTOs, calls `CognitoService`, shapes responses, and converts
Cognito exceptions into HTTP exceptions.

Behaviors worth noting:

- `signUp` returns `{ userConfirmed, userSub, username, message }`.
- `login` returns `{ tokens, user }` so the controller can set cookies and return
  only the user to the client.
- `refresh(email, refreshToken)` returns fresh tokens.
- `forgotPassword` returns the same generic message for unknown emails, preventing
  account enumeration (it swallows `UserNotFoundException`).
- No raw Cognito error is leaked except the deliberately user-facing
  `InvalidParameterException` message (see error mapping).

### `src/auth/auth-cookies.ts`

Centralizes cookie policy:

- Names: `access_token`, `id_token`, `refresh_token`, `auth_email`.
- Options: `httpOnly: true`, `sameSite: "lax"`, `secure` when
  `NODE_ENV === "production"`, `path: "/"`.
- Access/ID cookies use the token lifetime (`expiresIn`, normally 3600 s).
- Refresh and `auth_email` cookies last 30 days.
- Refresh cookie is only overwritten when Cognito returns a new refresh token.
- `clearAuthCookies` removes all four.

### `src/auth/auth-token.ts`

`extractAccessToken(request)`:

1. Prefer `Authorization: Bearer <token>` (mobile/API clients).
2. Fall back to the `access_token` cookie (browser).

### `src/auth/guards/cognito-auth.guard.ts`

- Lazily creates a `CognitoJwtVerifier` with `userPoolId`, `clientId`, and
  `tokenUse: "access"`.
- Extracts the token via `extractAccessToken`.
- Verifies signature, issuer, expiry, token use, and client ID.
- Attaches the payload to `request.user` and the raw token to `request.accessToken`.
- Returns `401` for missing, invalid, or expired tokens.

### `src/auth/decorators/current-user.decorator.ts`

- `@CurrentUser()` → token payload (currently available for future use).
- `@AccessToken()` → raw access token (used by `/auth/me`, logout, change password).

### `src/auth/dto/*.ts`

| DTO | Fields and validation |
| --- | --- |
| `SignUpDto` | `username` 3–128 chars matching `^[a-zA-Z0-9._-]+$`; `email` valid email, ≤254; `password` 8–256; optional `name` ≤100 |
| `LoginDto` | `email` valid email, ≤254; `password` ≤256 |
| `ConfirmSignUpDto` | `username` 3–128; `code` exactly 6 chars |
| `ResendConfirmationDto` | `username` 3–128 |
| `RefreshTokenDto` | optional `email`; optional `refreshToken` (cookie fallback) |
| `ForgotPasswordDto` | `email` |
| `ConfirmForgotPasswordDto` | `email`, 6-char `code`, `password` 8–256 |
| `ChangePasswordDto` | `previousPassword`, `proposedPassword` (min 8) |

Validation is enforced by the global pipe:

```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

`whitelist: true` strips unknown fields.

### `src/auth/auth.module.ts`

Declares `AuthController`, `AuthService`, and `CognitoService`; exports the services.

### `src/app.module.ts`

```ts
imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule]
```

`ConfigModule` loads `apps/api/.env` when the app is started from `apps/api`.

### `src/main.ts`

```ts
app.use(cookieParser());
app.enableCors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  credentials: true,
});
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

`credentials: true` is required for the browser to send/receive cookies
cross-origin. The origin must be exact (not `*`) when credentials are enabled.

---

## 9. Backend: API reference

Base URL: `http://localhost:4000`. All auth routes are under `/auth`.

| Method | Path | Auth | Request body | Success response |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/signup` | public | `username`, `email`, `password`, `name?` | `201` `{ userConfirmed, userSub, username, message }` |
| `POST` | `/auth/confirm` | public | `username`, `code` | `200` `{ message }` |
| `POST` | `/auth/resend-code` | public | `username` | `200` `{ message }` |
| `POST` | `/auth/login` | public | `email`, `password` | `200` `{ user, expiresIn }` + sets cookies |
| `POST` | `/auth/refresh` | cookie | `{}` (uses cookies) or `email` + `refreshToken` | `200` `{ expiresIn }` + sets cookies |
| `POST` | `/auth/forgot-password` | public | `email` | `200` `{ message }` |
| `POST` | `/auth/confirm-forgot-password` | public | `email`, `code`, `password` | `200` `{ message }` |
| `POST` | `/auth/logout` | optional | none | `200` `{ message }`; clears cookies, best-effort global sign-out |
| `POST` | `/auth/change-password` | required | `previousPassword`, `proposedPassword` | `200` `{ message }` |
| `GET` | `/auth/me` | required | none | `200` `{ username, sub, email, name?, email_verified?, ... }` |

“Required” means a valid access token via the `access_token` cookie or
`Authorization: Bearer <token>` header.

Example login response:

```json
{
  "user": {
    "username": "johndoe",
    "email": "you@example.com",
    "email_verified": "true",
    "name": "John Doe",
    "sub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  "expiresIn": 3600
}
```

No token appears in the JSON.

---

## 10. Authentication flows step by step

### Sign-up

1. `POST /auth/signup` with `username`, `email`, `password`, optional `name`.
2. `CognitoService.signUp` calls `SignUpCommand` using the **username** (not the
   email), sets the `email` attribute, and includes `SECRET_HASH`.
3. Cognito creates an unconfirmed user and emails a 6-digit code.
4. API returns `userConfirmed: false` plus a message.

### Confirm email

1. `POST /auth/confirm` with `username` and `code`.
2. `ConfirmSignUpCommand` is called with the same username and `SECRET_HASH`.
3. User becomes confirmed and can log in.
4. If the code expired or is wrong, the API returns 400 with a clear message.
5. `POST /auth/resend-code` issues a new code.

### Login

1. `POST /auth/login` with the **email alias** and password.
2. `InitiateAuthCommand` with `USER_PASSWORD_AUTH`:
   `USERNAME` = email, `PASSWORD`, `SECRET_HASH`.
3. API calls `GetUser` with the new access token to build a user profile.
4. Controller sets cookies (`access_token`, `id_token`, `refresh_token`,
   `auth_email`) and returns only `{ user, expiresIn }`.
5. Unconfirmed users get `403`; wrong credentials get `401`.

### Authenticated request

1. Browser calls `GET /auth/me` with `credentials: "include"`.
2. Browser automatically attaches the `access_token` cookie.
3. Guard verifies the JWT locally and attaches the payload.
4. Controller calls Cognito `GetUser` with the access token and returns the profile.

### Silent refresh

1. When an authenticated request returns `401`, `AuthProvider` calls
   `POST /auth/refresh` with an empty body.
2. Controller reads `auth_email` and `refresh_token` cookies.
3. `InitiateAuthCommand` with `REFRESH_TOKEN_AUTH` and `SECRET_HASH` returns a new
   access token (and ID token).
4. New access/ID cookies are set; the refresh cookie is left in place because
   Cognito does not return a new refresh token in this flow.
5. `AuthProvider` retries `GET /auth/me` once.

Why `auth_email` exists: `SECRET_HASH` needs the username/alias. Cognito does not
return the email in the refresh response, and refresh tokens are opaque, so the
email is cached in its own `HttpOnly` cookie.

### Logout

1. `POST /auth/logout` (no guard, so it works even with an expired access token).
2. Cookies are cleared immediately.
3. If an access token is present, `GlobalSignOut` is attempted; failures are ignored.
4. All refresh tokens for the user are revoked by Cognito.

### Forgot password

1. `POST /auth/forgot-password` with `email`.
2. Cognito sends a reset code.
3. Response is identical whether or not the account exists.
4. `POST /auth/confirm-forgot-password` with `email`, `code`, new `password`.
5. User can log in with the new password.

### Change password

1. User is authenticated; request includes cookies.
2. `POST /auth/change-password` with current and new passwords.
3. Guard verifies the access token; `ChangePasswordCommand` uses it.
4. Current session tokens remain valid.

---

## 11. Token and cookie strategy

### Tokens

| Token | Stored where | Used by |
| --- | --- | --- |
| Access token | `access_token` httpOnly cookie (plus optional Bearer header) | API guard on every protected request |
| ID token | `id_token` httpOnly cookie | Not currently read by backend; available for future use |
| Refresh token | `refresh_token` httpOnly cookie | `POST /auth/refresh` |
| Email alias | `auth_email` httpOnly cookie | `SECRET_HASH` during refresh |

Lifetimes:

- Access/ID cookies: `expiresIn` from Cognito (default 3600 seconds).
- Refresh and email cookies: 30 days (Cognito default refresh validity).
- Cookie `maxAge` is in milliseconds.

### Cookie attributes

```
HttpOnly   → JavaScript cannot read the value (XSS token theft mitigation)
SameSite=Lax → not sent on cross-site POSTs (basic CSRF mitigation)
Secure     → enabled automatically when NODE_ENV=production
Path=/     → available to all API routes
```

### Why not localStorage?

- localStorage is readable by any injected script and persists across sessions.
- httpOnly cookies keep token material out of JavaScript entirely.
- Trade-off: cookie-based auth needs CSRF awareness. `SameSite=Lax` plus a
  single allowed CORS origin is the current mitigation. A CSRF token can be added
  later for state-changing endpoints.

### Cross-origin behavior

- Browsers treat `localhost:3000` and `localhost:4000` as **same site** (ports do
  not affect SameSite), so `SameSite=Lax` cookies are sent.
- Frontend must send `credentials: "include"` (done in `lib/api.ts`).
- Backend must return `Access-Control-Allow-Credentials: true` and an exact origin
  (done in `main.ts`).
- If deployed as `app.example.com` + `api.example.com`, they are still same-site
  (same registrable domain), so `Lax` works.
- If deployed on completely different sites, use `SameSite=None; Secure` and add
  CSRF protection.

---

## 12. Error mapping

`rethrowCognitoError` in `auth.service.ts` translates Cognito exceptions:

| Cognito exception | HTTP | Message |
| --- | --- | --- |
| `UsernameExistsException` | 409 | Account with this email already exists |
| `InvalidPasswordException` | 400 | Password does not meet policy |
| `InvalidParameterException` | 400 | Cognito message; special-cased for “flow not enabled” |
| `CodeMismatchException` | 400 | Invalid verification code |
| `ExpiredCodeException` | 400 | Code expired; request a new one |
| `UserNotConfirmedException` | 403 | Confirm email before logging in |
| `PasswordResetRequiredException` | 403 | Password reset required |
| `NotAuthorizedException` | 401 | Invalid email or password |
| `UserNotFoundException` | 401 | Invalid email or password |
| `LimitExceededException` | 429 | Too many requests |
| `TooManyRequestsException` | 429 | Too many requests |
| `TooManyFailedAttemptsException` | 429 | Too many requests |
| anything else | 500 | Unhandled |

Special case: if `InvalidParameterException` contains `flow not enabled`, the API
returns an actionable message telling the developer to enable
`ALLOW_USER_PASSWORD_AUTH`.

Validation failures are handled earlier by `ValidationPipe` and return 400 with the
field errors (the frontend joins array messages into one string).

---

## 13. Frontend: file-by-file

### `lib/api.ts`

- `API_URL` from `NEXT_PUBLIC_API_URL` or `http://localhost:4000`.
- `ApiError` carries `status` and message.
- `request()` always uses `credentials: "include"`, sends JSON only when a body
  exists, parses JSON safely, and normalizes validation error arrays.
- Exposes `api.get<T>(path)` and `api.post<T>(path, body?)`.

### `lib/auth-context.tsx`

Client-side session provider:

- State: `user`, `loading`.
- On mount, calls `GET /auth/me`.
- On `401`, calls `POST /auth/refresh` with `{}` and retries `/auth/me` once.
- On failure, sets `user = null`.
- `refreshUser()` is exposed so login/signup pages can refresh after auth events.
- `logout()` calls `POST /auth/logout` and clears local user state.
- Important: tokens are never read or stored here; the browser handles cookies.

### `app/layout.tsx`

- Wraps the app in `<AuthProvider>`.
- Renders `<AuthNav />` above page content.
- Metadata updated to “Internship Project”.

### `app/components/auth-nav.tsx`

Auth-aware header:

- Signed out: “Sign in”, “Create account”.
- Signed in: user chip, “Dashboard”, “Sign out”.
- `Sign out` calls `logout()`; the dashboard redirects to login when `user` becomes
  `null`.

### `app/page.tsx`

Landing page:

- Explains the Cognito-backed auth.
- Shows different CTAs depending on session state.
- States that tokens live in httpOnly cookies.

### `app/login/page.tsx`

- Email + password form.
- Calls `POST /auth/login`, then `refreshUser()`, then navigates to `/dashboard`.
- Shows backend error messages.
- Links to signup.

### `app/signup/page.tsx`

Two-step flow in one page:

1. Details form: username, optional name, email, password.
2. After successful signup: verification form with a 6-digit code.
   - “Resend it” calls `POST /auth/resend-code`.
   - Successful confirm redirects to `/login`.

Client-side hints (`minLength`, `maxLength`, input types) mirror backend DTO rules.

### `app/dashboard/page.tsx`

- Client-side protection: redirects to `/login` when loading finishes with no user.
- Displays username, name, email, and Cognito `sub`.
- Change-password form calls `POST /auth/change-password` and shows success/error.
- Sign-out button calls `logout()` then navigates to `/login`.

### `app/auth.module.css`

Shared styling for cards, forms, inputs, buttons, errors, success messages, nav,
profile rows, and the landing hero. Dark-mode overrides included.

---

## 14. Frontend user journeys

### New user

1. Home → “Create account”.
2. Fill username, name, email, password.
3. Receive email code.
4. Enter code → redirected to login.
5. Log in with email + password → dashboard.

### Returning user

1. Home → “Sign in”.
2. Email + password → dashboard.
3. Access token expires after an hour; the next API call triggers silent refresh.
4. Sign out clears cookies and globally signs out.

### Password change

1. Dashboard → enter current + new password.
2. On success, stay signed in.

### Password reset (API only)

The backend endpoints exist, but there is currently **no frontend page** for
“forgot password”. See limitations.

---

## 15. Running the project

From the repository root:

```bash
npm install
npm run dev
```

That starts API (`:4000`), web (`:3000`), and admin (`:3001`) in parallel per the
root scripts.

Individual apps:

```bash
npm run dev:api
npm run dev:web
```

Open <http://localhost:3000>.

The API needs valid AWS credentials available in its process environment (env vars,
shared config, or instance/container role) in addition to the four Cognito env vars.

Verification commands:

```bash
npm run build -w @project/api
npm run build -w @project/web
npm run lint -w @project/api
npm run lint -w @project/web
npm test -w @project/api
```

All pass. The only existing test (`app.controller.spec.ts`) still passes.

---

## 16. Testing with curl

Use a cookie jar so the session persists between commands.

### Sign up

```bash
curl -i -X POST http://localhost:4000/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"username":"johndoe","email":"you@example.com","password":"TestPass123!","name":"John Doe"}'
```

### Confirm

```bash
curl -i -X POST http://localhost:4000/auth/confirm \
  -H 'Content-Type: application/json' \
  -d '{"username":"johndoe","code":"123456"}'
```

### Resend code

```bash
curl -X POST http://localhost:4000/auth/resend-code \
  -H 'Content-Type: application/json' \
  -d '{"username":"johndoe"}'
```

### Login (stores cookies in `cookies.txt`)

```bash
curl -i -c cookies.txt -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"TestPass123!"}'
```

Expected: `200`, JSON with `user` and `expiresIn`, plus four `Set-Cookie` headers
marked `HttpOnly`. No tokens in the JSON.

### Call a protected route with cookies

```bash
curl -i -b cookies.txt http://localhost:4000/auth/me
```

### Refresh

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:4000/auth/refresh \
  -H 'Content-Type: application/json' -d '{}'
```

### Change password

```bash
curl -i -b cookies.txt -X POST http://localhost:4000/auth/change-password \
  -H 'Content-Type: application/json' \
  -d '{"previousPassword":"TestPass123!","proposedPassword":"NewPass123!"}'
```

### Logout

```bash
curl -i -b cookies.txt -X POST http://localhost:4000/auth/logout
```

After logout, `GET /auth/me` with the same cookie jar returns `401`.

### Forgot password

```bash
curl -X POST http://localhost:4000/auth/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com"}'

curl -X POST http://localhost:4000/auth/confirm-forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","code":"123456","password":"NewPass123!"}'
```

### Inspecting cookie names/flags without exposing values

```bash
awk 'NF>=7 {print $1, $6}' cookies.txt
```

Expected output resembles:

```
#HttpOnly_localhost access_token
#HttpOnly_localhost id_token
#HttpOnly_localhost refresh_token
#HttpOnly_localhost auth_email
```

---

## 17. Verification performed

- `npm run build -w @project/api` — passed.
- `npm run lint -w @project/api` — passed.
- `npm test -w @project/api` — 1/1 passed.
- `npm run build -w @project/web` — passed; routes `/`, `/login`, `/signup`,
  `/dashboard` prerendered.
- `npm run lint -w @project/web` — passed after a React hooks rule fix (see below).
- Backend cookie flow tested live on a spare port (`4100`) to avoid the running dev
  server:
  - login → `200`
  - four `HttpOnly` cookies present
  - `/auth/me` with cookies → `200`
  - `/auth/me` without cookies → `401`
  - logout → `200`
  - `/auth/me` with the same jar after logout → `401`
  - login response contains `user` and `expiresIn`, no tokens
- Next.js dev server tested: `/`, `/login`, `/signup`, `/dashboard` → `200`.
- API reachable on `:4000` → `200`.

### React hooks lint fix

`react-hooks/set-state-in-effect` flagged `void refreshUser()` directly in
`useEffect`. It was changed to:

```ts
useEffect(() => {
  void (async () => {
    await refreshUser();
  })();
}, [refreshUser]);
```

Lint then passed.

---

## 18. Problems encountered and fixes

### A. Signup rejected the email as username

Error:

```
InvalidParameterException: Username cannot be of email format,
since user pool is configured for email alias.
```

Cause: the pool uses email as an **alias**, not as the username.

Fix:

- Added a required `username` field to signup, confirm, and resend DTOs.
- `CognitoService.signUp` sends `Username: username`, while `email` is an attribute.
- Login still uses the email alias.

### B. Login rejected by the app client

Error:

```
InvalidParameterException: USER_PASSWORD_AUTH flow not enabled for this client
```

Cause: the app client did not allow `ALLOW_USER_PASSWORD_AUTH`.

Fix:

- Enabled “Sign in with username and password” on the app client in the Cognito
  console.
- Improved the backend error message to point directly at this setting.

### C. Console location confusion

The flow setting moved in the newer console. Documented path:
**Applications → App clients → [client] → App client information → Edit → App
client flows**.

### D. Temporary credential-resolution failures while probing AWS

Some ad-hoc Node probes intermittently failed with
`CredentialsProviderError: Could not load credentials from any providers`, while
others succeeded. The application itself reached Cognito successfully. The SDK uses
the standard credential chain; ensure credentials are consistently available to the
API process.

### E. `next dev` failed once after `next build`

The first `npm run dev` failed at `next dev` immediately after a production build.
Both use the `.next` directory, and a stale process/port can cause a lock-style
failure. Subsequent starts succeeded, and all routes returned 200. Remedy: stop
stale dev servers and retry; both ports were confirmed free.

### F. Cookies initially were not used at all

The first implementation returned tokens in JSON. This was replaced by httpOnly
cookies, `cookie-parser`, credentialed CORS, and cookie-aware token extraction.

### G. Login response leaks nothing

After the cookie change, the login/refresh responses were deliberately reduced to
`{ user, expiresIn }` / `{ expiresIn }`. There is no fallback that returns tokens.

---

## 19. Security notes

Current posture:

- Tokens are `HttpOnly`, so JavaScript cannot read them.
- `SameSite=Lax` blocks cookies on cross-site POST/PUT/DELETE requests.
- CORS allows exactly one origin (`FRONTEND_URL`) with credentials.
- Access tokens are verified locally (signature, issuer, expiry, client ID,
  `token_use=access`).
- `GlobalSignOut` revokes refresh tokens on logout.
- Unknown-email password reset responses do not reveal account existence.
- DTOs whitelist/validate input; unknown fields are stripped.
- Client secret and AWS credentials are only in the backend environment.

Consider for production:

1. Serve both apps over HTTPS; cookies become `Secure` automatically when
   `NODE_ENV=production`.
2. Add a CSRF token for state-changing endpoints if the deployment spans different
   sites (then `SameSite=None; Secure` is required).
3. Add rate limiting (e.g., Nest throttler) on login, signup, confirm, and reset
   endpoints in addition to Cognito's own limits.
4. Set a Content Security Policy.
5. Rotate the app client secret and use a secret manager instead of `.env`.
6. Consider Cognito threat protection / advanced security features.
7. Store the ID token as a cookie only if needed; currently it is set but unused.
8. Use least-privilege IAM credentials dedicated to this API.
9. Add server-side route protection if SEO/SSR-protected pages are needed; the
   dashboard currently redirects client-side after load.

---

## 20. Known limitations and future work

- **No forgot-password UI.** Backend endpoints exist; only curl covers them.
- **No automated auth tests.** Only the default controller test exists. Unit tests
  for `AuthService` error mapping and e2e tests for cookies would be valuable.
- **Client-side dashboard protection.** Unauthenticated users briefly see the
  loading state before the redirect. A Next.js middleware/server check would tighten
  this.
- **No automatic refresh timer.** Refresh happens reactively on a 401. A proactive
  refresh shortly before expiry is possible.
- **No token revocation on password change.** Cognito's behavior is kept as-is.
- **`id_token` unused.** Could power user claims without a `GetUser` call.
- **No admin integration.** The admin app was not touched or protected.
- **No session/device listing.** Not implemented.

---

## 21. Command and file reference

### Commands

```bash
# Install
npm install

# Develop
npm run dev            # api + web + admin
npm run dev:api
npm run dev:web

# Build
npm run build -w @project/api
npm run build -w @project/web

# Lint
npm run lint -w @project/api
npm run lint -w @project/web

# Test
npm test -w @project/api
```

### Final backend auth tree

```
apps/api/src/
├── app.module.ts
├── main.ts
├── config/
│   └── env.ts
└── auth/
    ├── auth.module.ts
    ├── auth.controller.ts
    ├── auth.service.ts
    ├── cognito.service.ts
    ├── auth-cookies.ts
    ├── auth-token.ts
    ├── decorators/
    │   └── current-user.decorator.ts
    ├── guards/
    │   └── cognito-auth.guard.ts
    └── dto/
        ├── sign-up.dto.ts
        ├── login.dto.ts
        ├── confirm-sign-up.dto.ts
        ├── resend-confirmation.dto.ts
        ├── refresh-token.dto.ts
        ├── forgot-password.dto.ts
        ├── confirm-forgot-password.dto.ts
        └── change-password.dto.ts
```

### Final frontend tree

```
apps/web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── auth.module.css
│   ├── components/
│   │   └── auth-nav.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   └── dashboard/
│       └── page.tsx
└── lib/
    ├── api.ts
    └── auth-context.tsx
```

### Quick environment checklist

- [ ] `AWS_REGION`
- [ ] `COGNITO_USER_POOL_ID`
- [ ] `COGNITO_CLIENT_ID`
- [ ] `COGNITO_CLIENT_SECRET`
- [ ] AWS credentials available to the API process
- [ ] App client allows `ALLOW_USER_PASSWORD_AUTH`
- [ ] App client allows `ALLOW_REFRESH_TOKEN_AUTH`
- [ ] Pool has email alias and email verification enabled
- [ ] `FRONTEND_URL` matches the browser origin
