# Architecture Document

## 1. Overview & Goals

Multi-tenant venue listing and lead-generation platform. Users browse venues on a public site, while a separate admin console lets super admins manage the platform and venue owners publish/manage their own venues.

**Products**
- **Public LeadGen site** (`web`) — the customer-facing venue discovery surface.
- **Admin console** (`admin`) — internal management for super admins and venue owners.
- **Backend API** (`api`) — the single source of truth powering both apps.

**Roles**
- `SUPER_ADMIN` — full platform control; invites venue owners.
- `VENUE_OWNER` — creates and manages their own venues.

## 2. Tech Stack & High-Level Diagram

| Layer   | Technology                                          |
| ------- | --------------------------------------------------- |
| Frontend| Next.js (App Router, TypeScript)                    |
| Backend | NestJS (TypeScript)                                 |
| DB      | PostgreSQL                                          |
| ORM     | Prisma                                              |
| Auth    | JWT (httpOnly cookies), CSRF, CORS                  |
| Repo    | npm workspaces (monorepo)                           |

```
┌─────────────┐   ┌─────────────┐
│  web (Next) │   │ admin (Next)│
│ :3000       │   │ :3001       │
└──────┬──────┘   └──────┬──────┘
       │        HTTPS     │
       └─────────┬────────┘
                 ▼
        ┌──────────────────┐
        │   api (NestJS)   │
        │      :4000       │
        └────────┬─────────┘
                 │ Prisma
                 ▼
        ┌──────────────────┐
        │  PostgreSQL :5432│
        └──────────────────┘
```

## 3. Repo Layout

```
internship-project/
├── package.json            # npm workspaces + orchestration scripts
└── apps/
    ├── api/                # NestJS backend (:4000)
    ├── web/                # Public lead-gen site (:3000)
    └── admin/              # Admin console (:3001)
```

Workspace scripts: `dev` (all in parallel), `dev:api`, `dev:web`, `dev:admin`, `build`, `lint`.

## 4. System Components

### 4.1 Public LeadGen Site (`web`)
- **Nav bar** — branding, primary links, sign-in / account actions.
- **Hero section** — headline + search entry point.
- **Venues listing** — browse/searchable venue cards.
- **Filter UI** — city, price range, venue type/amenities; drives requests to the filter API.

### 4.2 Admin Console (`admin`)
- **Super admin** — invite venue owners, view/manage all venues, manage platform.
- **Venue owner** — create, edit, and manage their own venues.

### 4.3 Backend (`api`)
Modular NestJS application:
- **AuthModule** — sign-in, token issuance/refresh, logout.
- **UsersModule** — user CRUD, role assignment.
- **VenuesModule** — venue CRUD scoped by role.
- **InvitesModule** — super admin invitations.
- **FilterModule** — search/filter over venues.
- **PrismaModule** — shared DB access.

## 5. Authentication & Authorization

- **Roles**: `SUPER_ADMIN`, `VENUE_OWNER`.
- **Sign-in**: credentials → short-lived **JWT access token** stored in an **httpOnly cookie**; a longer-lived **refresh token** issues new access tokens.
- **CSRF**: SameSite cookies plus a CSRF token on state-changing requests to prevent cross-site request forgery.
- **CORS**: allow-list of `web` and `admin` origins; cookies sent with `credentials`.
- **RBAC guards**: route-level guards restrict actions (e.g., a venue owner can only mutate venues they own).
- **Passwords**: hashed (bcrypt/argon2), never stored in plaintext.

## 6. Data Model

```
User { id, email, passwordHash, role, venueId?, createdAt, updatedAt }
Venue { id, ownerId, name, description, city, priceRange, type, amenities[], status, lat, lng }
Invite { id, token, email, role, status, expiresAt, invitedById }
RefreshToken / Session { id, userId, token, expiresAt }
```

Relationships:
- `User 1─1 Venue` — a venue owner may own a single venue profile.
- `SuperAdmin 1─N Invite` — super admins issue invitations.
- `Invite → User` — accepted invite provisions the venue owner account.

## 7. Key Flows

### 7.1 Super Admin invites a venue owner
1. Super admin signs in → access token cookie.
2. Admin calls `POST /invites` with the owner's email.
3. API creates an `Invite` row (unique token, expiry) and emails a link.
4. Recipient opens link → validates token → sets password → account activated as `VENUE_OWNER`.

### 7.2 Venue owner manages a venue
1. Owner signs in.
2. `POST /venues` creates a venue owned by the user.
3. `PATCH /venues/:id` updates it (guarded to owner only).
4. Public site reflects the venue once `status` is published.

### 7.3 Public filter request
1. User applies filters on `web`.
2. `GET /venues?city=&type=&minPrice=&maxPrice=` hits the filter API.
3. API queries Prisma with filter params and returns matching venues.
4. `web` renders the results.

## 8. API Surface

| Method | Endpoint                | Access        | Description                  |
| ------ | ----------------------- | ------------- | ---------------------------- |
| POST   | `/auth/sign-in`         | Public        | Authenticate                 |
| POST   | `/auth/refresh`         | Refresh token | Rotate access token          |
| POST   | `/auth/sign-out`        | Authenticated | Revoke session               |
| POST   | `/invites`              | SUPER_ADMIN   | Invite a venue owner         |
| POST   | `/invites/:token/accept`| Public        | Accept invite, set password  |
| GET    | `/venues`               | Public        | List/filter venues           |
| GET    | `/venues/:id`           | Public        | Venue detail                 |
| POST   | `/venues`               | VENUE_OWNER   | Create venue                 |
| PATCH  | `/venues/:id`           | Owner/Admin   | Update venue                 |
| DELETE | `/venues/:id`           | Owner/Admin   | Remove venue                 |
| GET    | `/users`                | SUPER_ADMIN   | List users                   |

## 9. Security

- **Cookies**: `HttpOnly`, `Secure` (prod), `SameSite`.
- **CSRF**: SameSite + CSRF token validation on mutations.
- **CORS**: explicit origin allow-list, credentials enabled.
- **Password hashing**: bcrypt/argon2 with per-user salt.
- **Token lifecycle**: short-lived access tokens, revocable refresh tokens.
- **Input validation**: DTOs + validation (class-validator) on every route.

## 10. Environment & Ports

| Service  | Port | Notes                        |
| -------- | ---- | ---------------------------- |
| `api`    | 4000 | NestJS backend               |
| `web`    | 3000 | Public lead-gen site         |
| `admin`  | 3001 | Admin console                |
| Postgres | 5432 | Database (Prisma)            |

## 11. Out of Scope / Future

- Venue media/image uploads.
- Payments / bookings / deposits.
- Analytics & lead tracking dashboards.
- Email delivery service integration.
- Deployment / CI-CD configuration.