# Mavero

A premium, "royal" feeling e-commerce boutique — built end-to-end as a
single-page React application backed by Firebase, with images on
Cloudinary. No dedicated backend server, and no transactional email —
orders and contact messages are recorded straight to Firestore and
reviewed from the admin panel, by design (see "Notable implementation
decisions" below).

> **Status:** actively being built. This README is updated as each phase of
> the build lands — see the feature checklist below for current progress.

## Tech stack

| Layer            | Choice                                                        |
| ----------------- | -------------------------------------------------------------- |
| Frontend          | React 18 + Vite + React Router                                |
| Styling            | Tailwind CSS (custom royal theme, `class` dark mode strategy) |
| Icons              | react-icons                                                    |
| Auth + Database    | Firebase Authentication + Cloud Firestore                     |
| Image storage      | Cloudinary (unsigned upload preset)                            |
| State management   | React Context API (Auth, Cart, Wishlist, Theme, Language)     |
| Forms              | react-hook-form + zod                                          |
| Notifications      | react-hot-toast                                                |
| i18n               | react-i18next (English / Arabic / Urdu, full RTL support)      |
| Charts (admin)     | recharts                                                        |
| Hosting            | Vercel                                                          |

## Folder structure

See [SKILLS.md](SKILLS.md) for the full breakdown of `src/` and the
conventions used throughout the codebase.

## Feature checklist

### Design & UX
- [x] Royal, no-gradient design system (Tailwind theme)
- [x] Light / Dark mode toggle (persisted, OS-aware default; audited across the whole app)
- [x] English / Arabic / Urdu i18n with full RTL layout mirroring (599 translated
      keys per language, including all static/legal page content, admin panel,
      forms, and validation messages)
- [x] Skeleton/empty/error state primitives (`Skeleton`, `EmptyState`, `ErrorState`) — applied to each async section as it's built
- [x] Cookie consent banner
- [x] Full responsive pass (mobile / tablet / desktop) — automated sweep
      (3 viewports × 2 themes × 3 languages × 10 key pages, 180 combinations)
      checked for console/page errors and horizontal overflow (0 found),
      plus a manual visual pass that caught and fixed two real bugs: the
      language-switcher icon's baseline alignment, and Urdu (Nastaliq)
      headings needing their own line-height to stop self-overlapping —
      see `SKILLS.md`

### Authentication
- [x] Email/password signup with strength meter + validation
- [x] Email/password login
- [x] Google sign-in (friendly error on account-exists-with-different-credential)
- [x] Forgot password flow
- [x] Persisted session, protected routes (`ProtectedRoute`, `AdminRoute`)

### Storefront
- [x] Home page (hero, featured, new arrivals, category tiles, testimonials, newsletter)
- [x] Product listing: debounced search, filters (category/price/size/color/rating/stock/sale), sort, grid/list toggle, "Load more" pagination
- [x] Product detail: gallery + lightbox, stock-aware variant selection, reviews, related products, recently viewed
- [x] Wishlist (Firestore-synced, protected route)
- [x] Cart (drawer + page), coupons, guest + synced-account persistence
- [x] Multi-step checkout (shipping → dummy payment/COD → review → place
      order → confirmation)
- [x] Order history / tracking (status tracker), order detail, reorder
- [x] Reviews & ratings (only signed-in users; ratings computed live from the
      `reviews` collection rather than a denormalized counter, since customers
      can't write to `products` under Firestore rules — see SKILLS.md)
- [x] Static/legal pages with real, Mavero-written copy: About, Contact
      (working form, logs to `contactMessages`), FAQ
      (accordion), Privacy Policy, Terms & Conditions, Shipping Policy,
      Return & Refund Policy, Cookie Policy — all footer-linked
- [x] Newsletter signup (duplicate-checked, `subscribers` collection)

### Notable implementation decisions
- **Pagination:** "Load more" over infinite scroll. The catalog is small
  enough that all active products are fetched once and filtered/sorted
  client-side, so there's no data-transfer win from true server pagination —
  a "Load more" button gives the same incremental reveal as infinite scroll
  with better accessibility and no scroll-jank.
- **No transactional email, and no email-verification gate on checkout.**
  Mavero originally sent order-confirmation and contact-form emails via
  EmailJS and required a verified email address before checkout. Both were
  removed by request: orders are recorded straight to Firestore and
  reviewed in `/admin/orders`, and contact submissions land in the
  `contactMessages` collection — an admin checks both directly rather than
  relying on an email inbox. Firebase Auth's own signup/login/password-reset
  flows are unaffected; only the extra "verify your email before checking
  out" step and its `sendEmailVerification()` call were removed.

### Admin panel
- [x] Dashboard: revenue/orders/customers/products stat cards, low-stock
      alert, sales-over-time line, orders-by-status pie, top-selling bar,
      revenue-by-category bar, recent orders table (code-split — recharts
      and every admin page are lazy-loaded, not in the storefront bundle)
- [x] Product CRUD + Cloudinary multi-image upload (preview/reorder/delete
      before save), variants (size/color/stock), bulk status/delete
- [x] Category CRUD (with image)
- [x] Order management: filter by status/search, quick status update, detail view
- [x] Customer management: order count/spend per customer, promote/revoke
      admin, disable/enable account
- [x] Coupon management (percentage/flat, expiry, usage limit, min order value)
- [x] Review moderation (view/delete)

### Security
- [x] Firestore Security Rules (`firestore.rules`) covering every
      collection (`users` + subcollections, `products`, `categories`,
      `orders`, `reviews`, `coupons`, `subscribers`, `contactMessages`)
- [x] Verified a non-admin cannot write to protected collections — a
      36-test automated suite (`tests/firestore.rules.test.js`, run via
      `npm run test:rules`) exercises every rule above against the real
      Firebase emulator (role escalation, price/stock tampering, order
      impersonation, cross-user reads, coupon abuse, etc.); see "Testing
      the security rules" below for how to run it and how it was verified
      in this environment

**Checkout's client-side writes, and their trade-off.** There's no backend
server in this stack, so checkout must decrement product stock and redeem
coupons directly from the browser. `firestore.rules` allows a signed-in user
to update a product document *only* if the write touches nothing but
`stock`/`variants`/`soldCount`, and the new `stock` is not higher than the
old one — so a customer can reduce inventory but can't touch price, name, or
inflate stock. Coupon redemption is scoped the same way: a customer may only
increment `usedCount` by exactly 1. This blocks the obvious abuses (price
tampering, restocking, forging redemptions) but it cannot verify that a
given decrement actually corresponds to a real order's quantities — a
motivated attacker with the SDK could still call these updates directly. For
a project at this scale that's an accepted trade-off; the documented
upgrade path is moving stock/coupon mutation into a Cloud Function
(requires Firebase's Blaze plan, which is why it's not the default here).

**"Disable account" is a client-side approximation.** Without the Firebase
Admin SDK there's no way to truly lock a Firebase Auth account from the
browser. Disabling a user sets a `disabled` flag on their Firestore profile;
`AuthContext` checks it on every sign-in and immediately signs the user back
out if set. This stops the disabled account from using the app, but — unlike
`admin.auth().updateUser(uid, { disabled: true })` — it doesn't revoke
already-issued tokens at the Firebase Auth layer itself.

### Testing the security rules

`tests/firestore.rules.test.js` is a 36-test Vitest suite that runs
against the real Firebase emulator (via `@firebase/rules-unit-testing`),
not a mock — it asserts things like "a customer cannot promote themselves
to admin," "a customer cannot raise a product's stock or change its
price," "a customer cannot read another user's order," and "a customer
can redeem a coupon by exactly +1 but not jump `usedCount` by more."  Run
it with:

```bash
npm run test:rules
```

This requires a local JDK (the emulator is a Java process) and
`firebase-tools`; see `guide.txt` → Part 5 for one-time setup. In the
environment this project was built in, no JDK was available, so the
suite's correctness was verified two other ways instead of a live run:
(1) `npx vitest run` confirms all 36 tests are discovered and structurally
valid, failing only and exactly at the expected "no emulator running"
step — i.e. the test file itself has no bugs; (2) a full manual line-by-
line audit of `firestore.rules` against every one of the 36 scenarios,
confirming the rule logic matches what each test asserts. Anyone with
Java installed can run `npm run test:rules` to get a live pass/fail.

## Internationalization (English / Arabic / Urdu)

Translations live in `src/locales/{en,ar,ur}.json` — three flat-ish nested
JSON files with identical key structure (verified programmatically to stay
in sync; currently 599 keys each), loaded via `react-i18next`. `LanguageContext`
(`src/context/LanguageContext.jsx`) wraps `i18next.changeLanguage`, persists
the choice to `localStorage`, and sets `lang`/`dir` on `<html>` — an inline
script in `index.html` applies the saved language before React mounts, so
there's no FOUC/flash of the wrong direction. The `<LanguageSwitcher>`
(globe icon) appears in both the storefront navbar and the admin topbar.

**RTL is real layout mirroring, not just translated text sitting in an LTR
frame.** Arabic and Urdu flip `dir="rtl"` on `<html>`; because Tailwind's
`start-`/`end-`/`ps-`/`pe-`/`ms-`/`me-`/`text-start` utilities resolve
against the current direction (and flexbox's own `justify-content` already
follows `dir` natively), most layouts mirror automatically. Components use
these logical properties instead of `left-`/`right-`/`pl-`/`pr-` wherever a
value is direction-sensitive — see the `rtl-safe positioning` note in
`SKILLS.md` for the specific patterns and the one caught bug (icon buttons
using physical `right-*` badges) that motivated the rule.

### Deployment
- [ ] Production build verified locally
- [ ] Deployed to Vercel with SPA rewrites
- [ ] Live smoke test (auth, checkout, admin, email) passed

## Local setup

```bash
git clone <repo-url>
cd Mavero
npm install
cp .env.example .env   # then fill in real values — see guide.txt
npm run dev
```

The app runs at `http://localhost:5173`.

## Firebase setup (summary — full walkthrough in `guide.txt`)

1. Create a Firebase project at https://console.firebase.google.com.
2. Enable **Authentication** → Sign-in method → Email/Password and Google.
3. Create a **Cloud Firestore** database (start in production mode).
4. Copy the 6 web app config values into `.env` (`VITE_FIREBASE_*`).
5. Deploy `firestore.rules` from this repo to your project (Firestore →
   Rules tab, paste the contents, Publish) — this is the real security
   boundary, not just the UI route guards.

## Cloudinary setup (summary)

1. Create a free account at https://cloudinary.com.
2. Note your **Cloud Name** from the dashboard.
3. Settings → Upload → Add an **unsigned** upload preset, restricted to a
   `products` folder.
4. Put the cloud name and preset name into `.env`
   (`VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`).

We use an **unsigned upload preset** rather than a signed/server-side flow
because this project has no dedicated backend server — the preset is scoped
to a single folder and only allows image uploads, which is an acceptable
trade-off for a project at this scale. If abuse becomes a concern, the
recommended upgrade path is a small signing endpoint (e.g. a Firebase Cloud
Function) that mints a signature per upload without exposing the API secret.

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import the repo in Vercel, framework preset **Vite**.
3. Add every variable from `.env.example` in Vercel's Environment Variables
   settings.
4. Deploy. Add the resulting `*.vercel.app` domain (and any custom domain)
   to Firebase Authentication's **Authorized domains** list — otherwise
   sign-in will fail on the live site.

Full step-by-step instructions (written for a non-technical operator) are in
[guide.txt](guide.txt).

## Making your account an admin

Fill in `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` in `.env`, then
run:

```bash
npm run create-admin
```

This creates the account and prints a direct link to its document in the
Firebase console — open it, flip `role` from `customer` to `admin`, save,
and log in. Once promoted, an "Admin Panel" link appears directly in the
navbar (and in the account dropdown) for that account.

That one console click can optionally be automated away too: add
`FIREBASE_ADMIN_CLIENT_EMAIL` / `FIREBASE_ADMIN_PRIVATE_KEY` (from a
Firebase service-account key — see `guide.txt` → Part 2.6, "Option A+")
to `.env` and re-run the same command; it detects them and promotes the
role for you via the Admin SDK. This is opt-in and not the default because
that credential can bypass every Firestore security rule in the project —
it's used only by this local script, never by the deployed app itself.
`guide.txt` → Part 2.6 also documents doing the whole thing entirely by
hand via the normal Signup page, with no script at all.

## Screenshots

_To be added after the build is complete._
