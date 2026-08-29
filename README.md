# Pagewick

A premium, mobile-first story reading platform. No signup, no login, no accounts —
built as a static frontend that reads content from disk.

## Stack

- React + Vite
- react-router-dom (client-side routing)
- localStorage only (bookmarks, reading progress, ratings) — no backend, no Firebase

## Run locally

```
npm install
npm run build
npm run preview
```

(or `npm run dev` for a hot-reloading dev server)

To test the Razorpay checkout locally you need a dev server that also runs the
serverless functions (plain `vite dev` won't run `/api`):

- Netlify: `npx netlify-cli dev` (reads `.env` automatically)
- Vercel: `npx vercel dev` (reads `.env` automatically)

## Payments (Razorpay, test mode)

Pagewick is INR-only and uses Razorpay Standard Checkout — no other payment
provider is integrated. Pagewick V1 is a static site with no backend, so the
two things Razorpay requires server-side — creating an order and verifying
the payment signature — live in serverless functions instead of a
traditional server:

- `api/create-order.js` + `api/verify-payment.js` — Vercel style
- `netlify/functions/create-order.js` + `verify-payment.js` — Netlify style,
  same logic. `netlify.toml` / `public/_redirects` route `/api/*` to these.

Both read `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` from environment
variables — `KEY_SECRET` is never sent to the browser. The frontend
(`src/lib/razorpay.js`) only ever talks to `/api/create-order` and
`/api/verify-payment`; `create-order` hands back `key_id` at runtime so the
checkout modal can open with it. `key_id` is intentionally *not* passed via
a `VITE_`-prefixed env var — Vite inlines those into the built JS bundle at
build time, and Netlify's secret scanner flags a configured secret's value
showing up in build output, even for a value like key_id that isn't
actually sensitive on its own (this happened once already — see git
history).

`.env` holds test-mode credentials and is git-ignored. On Netlify/Vercel,
set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the site's dashboard
under Environment Variables — `.env` only works locally. Switching from
Test to Live mode requires no code changes at all: Razorpay uses the same
API endpoint for both, so it's purely a matter of which key values
(`rzp_test_...` vs `rzp_live_...`) are set in the dashboard.

A story unlocks by setting `"priceInPaise"` in its `story.json` (e.g. `4900`
= ₹49, one of the three approved tiers: ₹29 / ₹49 / ₹99). The "Unlock Story"
button on a premium story's details page opens Razorpay Checkout directly;
on a verified payment, the purchase is recorded in localStorage (same
no-account model as bookmarks/progress) via `recordPurchase()`, and every
locked chapter in that story becomes readable.

To test end-to-end, use Razorpay's published test card:
card `4111 1111 1111 1111`, any future expiry, any CVV, any name/OTP.

## Deploying

Push this project to a GitHub repo, then connect it to **Netlify** or **Vercel**.
Both will run `npm install` and `npm run build` on their own servers — you don't
need a computer to do this, everything can be done from GitHub's mobile app or
web UI plus the Netlify/Vercel dashboard.

- Build command: `npm run build`
- Publish directory: `dist`
- `netlify.toml` and `vercel.json` are already configured, including the SPA
  redirect rule so chapter/story URLs work on refresh and direct link sharing.

Before going live, update the placeholder text in:
- `public/sitemap.xml` (real domain)
- `src/pages/Privacy.jsx`, `Terms.jsx`, `Refund.jsx`, `Contact.jsx` (contact email,
  dates — no company registration details were invented, add your own)

## Publishing a new story

This is the whole workflow — no code changes required.

1. Create a folder: `src/content/stories/your-story-slug/`
2. Add `story.json`:
   ```json
   {
     "slug": "your-story-slug",
     "title": "Your Story Title",
     "author": "Author Name",
     "description": "A short hook for the story card and details page.",
     "genre": ["Horror", "Drama"],
     "access": "free",
     "featured": false
   }
   ```
3. Add a cover image: `thumbnail.jpg` / `.png` / `.webp` / `.svg` in the same folder.
   If it's missing, a graceful text fallback is shown instead — nothing breaks.
4. Add chapters in `chapters/`, named `chapter-1.md`, `chapter-2.md`, etc.
   The first line of each file, if it starts with `#`, becomes the chapter title.
   Chapters are always sorted numerically (chapter-2 before chapter-10), never
   alphabetically.
5. Commit and deploy. The story will automatically appear on the homepage,
   in Explore, under its genres, and in search — nothing in `App.jsx` or any
   other application file needs to change.

To verify this for yourself: `src/content/stories/test-story/` is a working
example added purely as content, with zero code changes. Delete its folder and
the app keeps working; the story just disappears from every list.

## What's intentionally not built yet (V1 scope)

- Real payments — the "Unlock Story" button on premium stories is a placeholder
  for a future Razorpay integration. It never claims a payment succeeded.
- Accounts / cloud sync — the Library page is per-device via localStorage, by design.
- Comments and likes — removed per spec. Only a mandatory one-time star rating
  at the end of a story remains.

## Structure

```
src/
  lib/
    stories.js   — the only file that knows how stories are discovered (import.meta.glob)
    storage.js   — all localStorage read/write (bookmarks, progress, ratings)
  components/    — Navbar, Footer, StoryCard, Hero, Row, RatingModal, Seo, ChapterText
  pages/         — Home, Explore, Genres, GenreDetail, Search, Library,
                   StoryDetails, Reader, Privacy, Terms, Refund, Contact, NotFound
  content/
    stories/
      haunted-mansion/   — first real story (Premium, Horror/Mystery, 5 chapters)
      test-story/        — proof that the dynamic system works (Free, 2 chapters)
```
