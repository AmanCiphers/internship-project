# internship-project

Full-stack monorepo: **NestJS** backend + **Next.js** frontend, managed with npm workspaces.

## Structure

```
apps/
  api/     NestJS backend  (http://localhost:4000)
  web/     Next.js frontend (http://localhost:3000)
  admin/   Next.js admin    (http://localhost:3001)
```

## Getting started

```bash
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend health check: http://localhost:4000

## Scripts

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `npm run dev`    | Run both apps in parallel         |
| `npm run dev:api`| Run only the NestJS backend       |
| `npm run dev:web`| Run only the Next.js frontend     |
| `npm run build`  | Build both apps                   |
| `npm run lint`   | Lint both apps                    |