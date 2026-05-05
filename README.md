# محور — Mihwar

> **Mihwar** (محور · "axis / pivot") — equipment custody platform for photography teams. Track every camera, lens, and light; hand off gear with a single confirmation; keep a full audit trail.

Built with Next.js 16, Tailwind v4, React Three Fiber, NextAuth v5, Prisma + PostgreSQL. Arabic-first (RTL) interface, dark/light theme, mobile-responsive, with 3D scroll choreography on the marketing site.

---

## Highlights

- **3D landing page** — scroll-driven camera rotation (R3F), animated bento, premium typography.
- **Full Arabic RTL** — IBM Plex Sans Arabic + Outfit (Latin) + JetBrains Mono.
- **Dark / light** — system-aware via `next-themes`, smooth toggle.
- **Mobile-first** — fluid bottom tab bar, breakpoint-tested at 320 / 768 / 1024 / 1440.
- **Equipment tracking** — bilingual fields, multi-image gallery, status & condition.
- **Custody transfer flow** — sender initiates → receiver confirms → ownership moves; audit-logged.
- **Audit trail** — every create / update / delete / transfer logged with actor + timestamp.
- **RBAC** — `ADMIN` (full) and `MEMBER` (own equipment + transfers).

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, RSC) |
| UI | React 19, Tailwind v4 (CSS-config), Radix Primitives |
| 3D | three.js 0.184, React Three Fiber 9, drei |
| Motion | motion (Framer Motion 12), GSAP (isolated) |
| Auth | NextAuth v5 (JWT, Credentials), bcryptjs |
| DB | PostgreSQL + Prisma 7 |
| Validation | Zod 4 |
| Icons | @phosphor-icons/react |
| Fonts | IBM Plex Sans Arabic, Outfit, JetBrains Mono |

---

## Local development

```bash
# 1. Install deps
pnpm install

# 2. Configure env
cp .env.example .env
# Edit DATABASE_URL and AUTH_SECRET

# 3. Generate Prisma client + push schema
pnpm prisma generate
pnpm db:push

# 4. Seed initial admin + sample data
pnpm db:seed

# 5. Run dev server
pnpm dev
# → http://localhost:3000
```

Default credentials after seeding:

- **Admin:** `admin@mihwar.local` / `Mihwar@2026`
- **Members:** `yara@mihwar.local`, `majd@mihwar.local`, `rana@mihwar.local` / `Member@2026`

---

## Deploy on Coolify

### 1. Create the application
1. In Coolify, **New Resource → Public Repository**, paste this repo URL.
2. **Build Pack:** `Dockerfile`.
3. **Port:** `3000`.
4. **Health check path:** `/api/health`.

### 2. Add a Postgres resource
1. **New Resource → Database → PostgreSQL**.
2. Note the **internal connection string** (Coolify exposes both internal/external).

### 3. Wire env vars
Paste into Coolify "Environment Variables" — see `.env.example` for the full list:

```
DATABASE_URL=postgresql://USER:PASSWORD@<postgres-service>:5432/mihwar
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://<your-domain>
NEXT_PUBLIC_APP_URL=https://<your-domain>
ADMIN_EMAIL=admin@mihwar.local
ADMIN_PASSWORD=<change-me>
ADMIN_USERNAME=admin
ADMIN_NAME=مدير الفريق
RUN_SEED=true
NODE_ENV=production
```

### 4. Deploy
Click **Deploy**. The container's `entrypoint.sh` will:

1. Run `prisma db push` to sync the schema.
2. If `RUN_SEED=true`, run `prisma/seed.ts` (creates admin + sample data).
3. Start the Next.js standalone server.

After the first successful boot, set `RUN_SEED=false` (or remove the variable) so re-deploys don't reseed.

### 5. (Optional) Bind a domain
Bind your domain in Coolify, then update `AUTH_URL` and `NEXT_PUBLIC_APP_URL` and redeploy.

---

## Project structure

```
mihwar/
├── prisma/
│   ├── schema.prisma     # User, Equipment, Transfer, AuditLog
│   └── seed.ts           # Admin + demo data
├── docker/
│   └── entrypoint.sh     # Run db push + optional seed, then start
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # Marketing landing (3D)
│   │   ├── login/        # Auth page
│   │   ├── dashboard/    # Authenticated area
│   │   └── api/          # Auth + health
│   ├── actions/          # Server actions (auth, equipment, members, transfers)
│   ├── components/
│   │   ├── 3d/           # R3F scenes (HeroScene, CameraModel, AxisRing, EquipmentTilt)
│   │   ├── landing/      # Hero, FeaturesBento, FlowSection, CTA, Nav, Footer
│   │   ├── dashboard/    # Sidebar, Header, MobileTab, StatCard, Forms, TransferRow
│   │   ├── ui/           # Buttons, inputs, dialog, etc. (custom shadcn-style)
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── lib/
│   │   ├── auth.ts       # NextAuth instance
│   │   ├── auth.config.ts
│   │   ├── prisma.ts
│   │   ├── i18n.ts       # All Arabic copy
│   │   └── utils.ts
│   ├── proxy.ts          # NextAuth route guard (Next.js 16 proxy convention)
│   └── types/next-auth.d.ts
├── Dockerfile
└── README.md
```

---

## Roles & flow

```
┌──────────────────────────────────────────────────────────┐
│ Admin (مدير)                                              │
│ ─ Manage users, equipment, all transfers, audit log      │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
   ┌──────────────────────────────────────────┐
   │ Equipment owned by Member / Studio       │
   └─────────────┬───────────────┬────────────┘
                 │ initiate      │
                 ▼               ▼
   ┌────────────────────────┐ ┌────────────────────────┐
   │ Sender → fills form    │ │ Equipment → IN_TRANSIT │
   │ (receiver, message,    │ │ Audit: TRANSFER_INIT   │
   │  return date)          │ └────────────────────────┘
   └───────┬────────────────┘
           │
           ▼
   ┌────────────────────────┐
   │ Receiver inbox         │
   │ Confirm → ownership    │
   │ Reject  → status reset │
   └────────────────────────┘
```

---

## License

Private — internal use by the studio team.
