# Mavero — Internal Conventions

Living document of the conventions established while building Mavero. Update
this whenever a new pattern is introduced.

## Folder structure

```
src/
  assets/          static images/logos bundled at build time (brand only —
                    all product/content images come from Cloudinary)
  components/
    common/         generic reusable UI (buttons, skeletons, empty states...)
    layout/         navbar, footer, drawers, admin shell
    product/        product card, gallery, filters, etc.
    cart/           cart drawer/line items
    checkout/       shipping form, payment step, review step
    admin/          admin-only widgets (tables, charts, forms)
  context/          React Context providers (Auth, Cart, Wishlist, Theme, ...)
  hooks/            custom hooks
  lib/              third-party SDK setup (firebase.js, cloudinary.js)
  locales/          en.json / ar.json / ur.json translation files
  pages/            route-level components (one per route)
    admin/          admin route pages
    legal/           static/legal pages
  routes/           route guard components (ProtectedRoute, AdminRoute)
  styles/           global CSS (Tailwind entry)
  utils/            pure helper functions (formatters, validators)
```

## Tailwind / design tokens

- Colors are semantic-ish groups in `tailwind.config.js`: `charcoal` (near-black
  base), `navy`/`emerald`/`burgundy` (royal accent families, currently
  charcoal + gold are the primary pairing in use), `gold` (brass/accent),
  `ivory`/`champagne` (light backgrounds). **Never** use Tailwind's gradient
  utilities (`bg-gradient-*`) anywhere — flat colors only, per brand rules.
- Dark mode uses the `class` strategy. Toggle by adding/removing `dark` on
  `<html>` (see `ThemeContext`). Always pair a light class with a `dark:`
  variant — don't ship a component that only looks right in one theme.
- Reusable component classes live in `src/styles/index.css` under
  `@layer components` (`.btn-primary`, `.btn-secondary`, `.input-field`,
  `.card-surface`, `.label-uppercase`). Prefer these over ad-hoc utility
  soup when a pattern repeats 3+ times.
- Headings use `font-serif` (Playfair Display / Cormorant Garamond). Body
  text uses `font-sans` (Inter / Manrope). Arabic/Urdu locales swap in
  `font-arabic` / `font-urdu` automatically via the `[lang]` attribute — see
  `src/styles/index.css`.

## Firebase / Firestore

- All SDK setup lives in `src/lib/firebase.js`, exporting `auth`, `db`,
  `googleProvider`. Never call `initializeApp` anywhere else.
- Firestore is the source of truth; Firestore Security Rules
  (`firestore.rules`) are the **real** enforcement boundary — UI route guards
  are a UX convenience only, never trust the client.
- Every user document has a `role` field (`customer` | `admin`), set to
  `customer` on signup and immutable from the client afterwards (rules
  enforce this — see `firestore.rules`).
- Collections: `users` (+ subcollections `cart`, `wishlist`, `addresses`),
  `products`, `categories`, `orders`, `reviews`, `coupons`, `subscribers`,
  `contactMessages`.
- Every data-fetching hook's `catch` block calls `console.error("[Mavero]
  <hookName> fetch failed:", err)` *before* `setError(err)` — the UI only
  ever shows a generic message (`ErrorState`), so without this line a real
  error (a missing composite index, a rules rejection, a typo'd field
  name) is invisible anywhere except by guessing. This is what let the
  missing-orders-index issue be diagnosed from the console instead of
  digging through the Network tab. Add the same line to any new hook that
  follows this fetch/loading/error pattern.

## Admin bootstrap script

`scripts/createAdminUser.js` (`npm run create-admin`) creates/signs into an
account and writes its Firestore profile via the regular client SDK — that
part always goes through `firestore.rules` like any other write, and a
fresh self-created profile can only be written with `role == "customer"`
(the same rule that stops a malicious signed-up customer from
self-promoting). The client SDK genuinely cannot go further than that.

Promoting to `role: admin` therefore branches on whether
`FIREBASE_ADMIN_CLIENT_EMAIL` / `FIREBASE_ADMIN_PRIVATE_KEY` are set in
`.env`:
- **Not set (default):** prints a deep link straight to that account's
  document in the Firebase console; you flip the field yourself, one
  click.
- **Set:** dynamically imports `firebase-admin` (kept out of the "not set"
  path's startup cost on purpose) and writes `role: admin` directly via
  the Admin SDK, which — unlike the client SDK — is allowed to bypass
  `firestore.rules` entirely. This is the *only* thing in the whole
  project that holds a credential capable of that, which is exactly why
  it's opt-in rather than the default, why it's read with plain
  `process.env` instead of a `VITE_`-prefixed var (Vite inlines every
  `VITE_*` value into the browser bundle — a bypass-everything credential
  must never end up there), and why it's used by this one local script
  only, never by the deployed app. Don't reach for this pattern to solve
  other "the client SDK won't let me" problems — it exists here because
  bootstrapping the very first admin is a genuine chicken-and-egg case
  with no other legitimate way through.
- Either way, `ADMIN_BOOTSTRAP_EMAIL`/`ADMIN_BOOTSTRAP_PASSWORD` (also
  plain `process.env`, also never `VITE_`-prefixed) supply the new
  account's own login, which is unrelated to the service-account
  question above.

## Protected routes

- `<ProtectedRoute>` (in `src/routes/`) redirects unauthenticated users to
  `/login`, preserving the intended destination.
- `<AdminRoute>` additionally checks `role === 'admin'` from the auth
  context's user profile before rendering; otherwise redirects home.
- Both are UI convenience only — the matching Firestore rule is the actual
  gate.

## Image uploads

- Product/category images upload directly from the browser to Cloudinary
  using an **unsigned upload preset** scoped to a `products` folder (no
  backend needed, no secret exposed client-side). See `src/lib/cloudinary.js`
  and the trade-off note in `README.md`.

## i18n

- Translation strings live in `src/locales/{en,ar,ur}.json`, loaded via
  `react-i18next`. Component code should never contain hardcoded
  user-facing English strings — always call `t('key')`.
- Arabic and Urdu are RTL: `dir` is set on `<html>` alongside `lang` by
  `LanguageContext`. Use logical Tailwind spacing (`ps-`/`pe-`/`ms-`/`me-`)
  over `pl-`/`pr-`/`ml-`/`mr-` in any component that needs to mirror.

## Forms

- All forms use `react-hook-form` + a `zod` schema resolved via
  `@hookform/resolvers/zod`. Validation messages come from the i18n
  dictionary, not hardcoded strings.

## Fixed-position overlays (drawers, modals)

Any `fixed inset-0` overlay (mobile nav drawer, cart drawer, modals) must be
rendered via `createPortal(..., document.body)`, not left inline in the
component tree. The navbar is `sticky` with `backdrop-blur`, and
`backdrop-filter` on an ancestor creates a new CSS containing block for
`position: fixed` descendants — so a `fixed` drawer nested inside the header
would size itself against the header's box instead of the viewport (an 80px
sliver, not a full-screen overlay). Portaling to `document.body` sidesteps
this entirely and is also just correct practice for z-index/stacking-context
hygiene. See `src/components/layout/Navbar.jsx` for the pattern.

## Icon-only trigger buttons inside a positioning wrapper

An icon button that's a *direct* child of a `flex items-center` row (search,
theme toggle, cart, wishlist in `Navbar.jsx`) centers cleanly for free. One
that needs its own `relative` wrapper div for a dropdown (the language
switcher, the account menu) does not — the wrapper div's own box can be a
couple of pixels taller than its plain `<button>` child depending on
line-height, so the icon inside drifts off the shared baseline of its
siblings even though every button uses the same icon size. Give the trigger
`<button>` itself `flex items-center` (not just its wrapper) so the icon is
centered within the button's own box regardless of ambient line-height. See
`src/components/common/LanguageSwitcher.jsx`.

## Headings on deliberately-dark sections (light mode)

`src/styles/index.css` sets a global default heading color in `@layer base`
(`h1`–`h6 { text-charcoal-900 dark:text-ivory-100 }`) so headings are legible
on the site's normal ivory background everywhere without per-component
classes. That default color is set **directly on the heading element**, so
it does not inherit from a parent's `text-ivory` — any section that
intentionally flips to a dark flat-color background in light mode (e.g. the
home hero, a dark testimonial band) needs an explicit `text-ivory` class on
its own heading, or the heading renders dark-on-dark and disappears. `dark:`
variants don't need this — they already resolve correctly through the base
rule. See `src/pages/Home.jsx`'s hero and testimonials sections.

## Firestore data model — products & categories

- `categories/{slug}`: `{ name, slug, description, image, createdAt }`.
- `products/{sku}`: `{ sku, name, description, category (slug), price,
  salePrice (nullable), tags[], images[] (Cloudinary URLs), variants[]
  (`{ size, color, stock, sku }`, empty array if the product has no
  variants), stock (sum across variants, or a flat number), featured
  (bool), status ('active' | 'draft' | 'out_of_stock'), averageRating,
  reviewCount, createdAt }`.
- Seed data lives in `scripts/seedData.js` (plain data, no Firebase calls)
  and is written to Firestore by `scripts/seedProducts.js` (`npm run seed`).
  The seed script signs in as an existing admin account (email/password
  prompted interactively) so its writes pass `firestore.rules` — it never
  bypasses rules via a service account, keeping the whole stack on
  client-SDK auth as used everywhere else in the app.
- Seed images are fetched from a placeholder image service and re-uploaded
  to Cloudinary via a remote-URL POST to the unsigned upload endpoint (same
  preset the admin panel uses), so even seed data ends up genuinely hosted
  on Cloudinary rather than hot-linked elsewhere.

## Checkout & orders

- `src/utils/placeOrder.js` is the single place that creates an order: it
  decrements stock (grouped per product, one Firestore transaction per SKU
  so multiple variants of the same product in one cart don't clobber each
  other), redeems the coupon if any, and writes the `orders` doc. Call this
  instead of writing order-placement logic inline in a component. There is
  no transactional email anywhere in this project (removed by request,
  along with the email-verification checkout gate) — orders are reviewed
  in `/admin/orders`, not by inbox.
- Card fields use `react-hook-form`'s `Controller` wrapping `IMaskInput`
  (from `react-imask`) rather than `register()` directly — `IMaskInput`
  isn't a plain `<input>`, so it needs the mask's `onAccept` wired to RHF's
  `field.onChange` by hand. See `src/components/checkout/PaymentStep.jsx`.
- Card validation (`src/utils/cardValidation.js`) is format-only (Luhn
  checksum + non-expired MM/YY) — there is no real payment gateway
  anywhere in this project, by design.
- Orders are addressed by Firestore doc id in routes
  (`/order-confirmation/:orderId`), but shown to the customer by a separate
  human-readable `orderNumber` (`MAV-YYYYMMDD-XXXX`) generated in
  `placeOrder.js`. Never expose the raw doc id in UI copy.

## Admin panel

- One hook per collection under `src/hooks/useAdmin*.js` (`useAdminProducts`,
  `useAdminOrders`, `useAdminUsers`, `useAdminCoupons`, `useAdminCategories`,
  `useAdminReviews`) — each fetches the *entire* collection (admin views see
  drafts/out-of-stock too, unlike the public `use*` hooks that filter to
  `status == 'active'`) and exposes plain create/update/delete functions
  that refetch afterward. No caching layer — the catalog is small enough
  that a full refetch after every mutation is simpler and fast enough.
- `src/components/admin/ImageUploader.jsx` is shared by product and
  category forms — reorder is two arrow buttons swapping array indices, not
  drag-and-drop, to avoid a DnD dependency for a rarely-reordered list.
- The whole `/admin` route tree is `React.lazy`-loaded from `App.jsx`
  (charts, admin forms, and recharts itself never ship in the storefront
  bundle a customer downloads). Keep new admin pages behind the same
  pattern — add the lazy import + a `<Suspense>` wrapper, don't import an
  admin page eagerly from a non-admin file.
- Dashboard charts use a **separate, validated categorical palette**
  (`src/lib/chartColors.js`), not the brand's charcoal/gold/navy/burgundy
  tokens — the brand palette is deliberately desaturated for the boutique
  look and fails the chroma floor a chart needs to keep series
  distinguishable (see the dataviz skill). Chart chrome (grid/axis/tooltip)
  still follows the app's ivory/charcoal theme via `useTheme()`; only the
  data-encoding marks (bars/lines/pie slices) use the separate palette.

## i18n & RTL

- Every user-facing string goes through `useTranslation()` + `t('namespace.key')`
  — never hardcode English in a component. Locale files
  (`src/locales/{en,ar,ur}.json`) are checked for key-parity with a small
  Node script during development (flatten both objects, diff the key sets)
  — run that check after adding keys to any one locale to catch the other
  two falling out of sync.
- **Schemas that produce user-facing text (zod validation messages) are
  factory functions, not static objects.** `src/utils/schemas.js` exports
  `getLoginSchema(t)`, `getAddressSchema(t)`, etc. — each called inside the
  component with the current `t`, because zod messages are plain strings
  baked in at schema-creation time and can't react to a language change
  after the fact. If you add a new form, follow this pattern; don't export
  a bare `z.object(...)`.
- **rtl-safe positioning:** use Tailwind's logical properties
  (`start-`/`end-`, `ps-`/`pe-`, `ms-`/`me-`, `text-start`/`text-end`)
  instead of `left-`/`right-`/`pl-`/`pr-`/`text-left`/`text-right` on
  anything direction-sensitive (absolute-positioned badges, drawer
  slide-in edges, icon buttons glued to one side of an input). Flexbox's
  `justify-content` and a plain `flex-row`'s visual order already follow
  `dir` natively, so most layouts mirror for free — the utilities above
  are only needed for values CSS doesn't auto-flip (absolute `inset-*`,
  margins/padding, text alignment). Directional icons (arrows, chevrons in
  a lightbox/breadcrumb) need `rtl:rotate-180` or `rtl:-scale-x-100`
  explicitly — icons never auto-flip.
- **Paragraphs with an embedded link don't get machine-translated
  mid-sentence.** Word order differs too much across en/ar/ur to safely
  split a sentence at a link boundary with simple string interpolation.
  Convention used throughout: store the paragraph as one complete,
  self-contained translated string; if the English source had "see our X
  page" inline, either fold that reference into the translated sentence as
  plain text (no link), or — if the reference is genuinely a separate
  pointer ("see related policies below") — render actual `<Link>`s as a
  list after the paragraph instead of inline. Don't use `Trans` unless a
  future case genuinely needs a link mid-sentence; none of the current
  content did once phrased this way.
- Numbers/dates/card fields stay LTR even inside RTL text (`dir="ltr"` on
  the specific input) — see the card number/expiry fields in
  `PaymentStep.jsx`. Mixing digit direction into RTL prose reads as broken,
  not stylistic.
- **Urdu (Nastaliq) needs its own line-height, not just its own font.**
  Noto Nastaliq Urdu is a cursive script that stacks diagonally and its
  glyphs extend well beyond the normal em-box — at Tailwind's default
  heading line-height (often `1`), Urdu headings visually overlap
  themselves and bleed into whatever sits above/below them (caught on the
  404 page: the heading collided with its own eyebrow label). Fixed with
  `[lang="ur"] h1..h6 { line-height: 1.9–2.1 }` in `src/styles/index.css`,
  next to the existing `[lang="ur"]` font-family swap — that selector's
  specificity (attribute + tag) already outranks a single Tailwind
  `text-*`/`leading-*` utility class, so no `!important` is needed. Arabic
  (Naskh) doesn't need this — it doesn't stack the same way.
- **A screenshot artifact worth knowing about, so it isn't mistaken for a
  bug:** Playwright/Chromium's `fullPage: true` screenshot expands the
  viewport to the full document height before capturing, so a
  `position: fixed` element (the cookie banner, cart drawer, etc.) renders
  pinned at a fixed pixel offset within that *expanded* viewport — i.e. it
  appears to float in the middle of a full-page screenshot instead of at
  the real bottom of the screen. This looked exactly like a layout bug the
  first time it showed up (cookie banner overlapping mid-page content).
  Confirm with a normal (non-fullPage) viewport screenshot at the relevant
  scroll position before treating a `fixed`-element overlap as real.

## Naming

- Components: `PascalCase.jsx`. Hooks: `useCamelCase.js`. Context files:
  `XContext.jsx` exporting a provider + a `useX()` hook.
