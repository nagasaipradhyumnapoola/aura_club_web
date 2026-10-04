# AURA — website

**AI United for Real World Applications** · SRM Institute of Science and Technology

One continuous page. A single persistent spark travels through it, from the opening wordmark assembly to the recruitment application and the contact section.

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis · Zod · Supabase (server-side only).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint       # type-check
```

Node 20+ is fine.

## Things you configure (nothing is invented)

| What | Where |
| --- | --- |
| Social links, email, Operations contact | [`data/site.ts`](data/site.ts). Instagram and email are set; LinkedIn shows as an unlinked "Coming soon" placeholder until you add its URL. |
| What we do / principles / structure / recruitment copy | [`data/activities.ts`](data/activities.ts), [`data/principles.ts`](data/principles.ts), [`data/structure.ts`](data/structure.ts), [`data/recruitment.ts`](data/recruitment.ts) |
| Application questions, limits, validation | [`lib/validation/application.ts`](lib/validation/application.ts) — shared by the browser and the server |

There are no member counts, dates, partners, testimonials or other statistics on the site, and none should be added until they exist.

## Applications → Supabase

1. Create a Supabase project and run [`supabase/migrations/0001_aura_applications.sql`](supabase/migrations/0001_aura_applications.sql). RLS is enabled with **no public policies**: only the server (service role) can write, and nobody can read through the public API.
2. Env files are never committed (every `.env*` except the `.env.example` template is git-ignored). Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Never prefix them with `NEXT_PUBLIC_`.
3. Submissions go to `POST /api/apply` ([`app/api/apply/route.ts`](app/api/apply/route.ts)).

Until those variables exist the endpoint answers `503`, and the form shows a clear message and **keeps everything the applicant typed**. It never pretends to have saved.

To try the full flow locally without a database, set `AURA_DRY_RUN=true` in `.env.local`. It is ignored when `NODE_ENV=production`.

What the endpoint does, in order: per-IP rate limit → size limit → JSON/shape check → honeypot (silently accepted, nothing stored) → minimum fill time → optional Cloudflare Turnstile (`TURNSTILE_SECRET_KEY`) → full server-side validation (URLs normalised and host-checked) → per-email rate limit → insert.

- Idempotency: each draft carries a nonce stored in a unique column, and `(email, team)` is unique. A repeat submit (double click, retry after a network drop) returns success without creating a second row — and without revealing whether an address has applied.
- The in-memory rate limiter ([`lib/utils/rateLimit.ts`](lib/utils/rateLimit.ts)) is per server instance. On serverless / multi-instance hosting, swap `check()` for a shared store (Upstash, Vercel KV…); the call sites stay the same.
- Selection tooling (status changes, reviews) belongs in a separate authenticated admin surface, not in this public site.

## How the motion works

- **One spark.** [`components/aura/AuraSpark.tsx`](components/aura/AuraSpark.tsx) is a single fixed SVG, driven by the engine in [`lib/motion/spark.ts`](lib/motion/spark.ts). Every scene registers a few *waypoints* (`useSparkTrack`) — scroll position plus where the spark is, how big, how rotated, in front of or behind the type, filled or outlined. The engine interpolates between them with inertia, a slight stretch with scroll velocity, and a faint pointer disturbance on desktop. In front of text it uses `mix-blend-mode: difference`, so it cuts through type in both themes.
- **Scenes.** On desktop each scene is a CSS `position: sticky` stage with a scrubbed GSAP timeline ([`useScene`](lib/motion/hooks.ts)); on phones the same scenes flow normally and reveal as they pass. No ScrollTrigger pinning is used.
- **Logo and header.** The wordmark never moves: it fades in (opacity only), and fades out as you scroll away. The top bar has no name: the floating AURA spark sits at the top left, the menu and the colour (theme) switch on the right, on translucent glass. The bar appears once you scroll past the opening.
- **Floating figure.** [`AuraFigure`](components/aura/AuraFigure.tsx) is the supplied aura image (`public/aura/figure.webp`, converted so its dark background is transparent and it works in both themes). It fades in once the logo has left the hero, bobs gently, and drifts upward over the whole length of the page.
- **Application reveal.** The CTA sends the spark into the button, then the application layer opens through a spark-shaped clip path (an ink-coloured copy leads, the page-coloured layer follows).
- **Cursor.** A small dot that becomes a ring on links, a caret over fields, the spark over the wordmark, a labelled disc on the main CTA. Touch devices get a short ripple on tap instead. Hover effects only apply on hover-capable devices.
- **Reduced motion.** All content stays; scenes show their final state with a plain fade, smooth scrolling is off, the spark is static.
- **Theme.** First visit follows the system; the choice is stored in `localStorage` (`aura-theme`) and applied before first paint. Switching cross-fades colours.

The wordmark and spark are vector traces of the supplied artwork ([`lib/utils/paths.ts`](lib/utils/paths.ts), generated). Static copies are in `public/aura/`.

## Layout

```
app/                 layout, page, global CSS (styles/), api/apply
components/aura      logo, spark, background, cursor, provider
components/intro     opening sequence
components/activities, structure, principles, recruitment, contact
components/application  overlay, steps, fields, review, success
components/navigation   header, mobile menu, theme toggle
data/                all copy and site configuration
lib/motion           spark engine, scroll helpers, hooks
lib/validation       shared Zod schemas + step definitions
lib/supabase         server-only client
supabase/migrations  table definition
```

## Quick checks

- No horizontal overflow from 320 px to ultrawide; headlines are checked not to clip at 320 / 360 / 390 / 768 / 1024 / 1280 / 1440 px.
- Keyboard: skip link, visible focus, dialog focus trap, `Esc` closes the application (draft kept).
- Forms: labels, `aria-invalid`, associated errors, first invalid field focused, nothing erased on failure, draft kept in `sessionStorage` until the server confirms.
