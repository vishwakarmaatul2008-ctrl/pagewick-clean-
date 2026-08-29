# Adding a story to Pagewick

Pagewick's catalogue is fully data-driven. `src/lib/stories.js` is the only
file that knows how stories are discovered — it scans
`src/content/stories/*/` at build time and assembles every story
automatically. No other file (Home, Explore, Search, Genres, Library,
StoryDetails, Reader, the Razorpay checkout) ever references a story by
name. Adding a story means adding a folder — nothing else.

## Folder structure

```
src/content/stories/<story-slug>/
  story.json
  thumbnail.jpg          (or .jpeg / .png / .webp / .svg)
  chapters/
    chapter-1.md
    chapter-2.md
    chapter-3.md
    ...
```

`<story-slug>` becomes the story's URL (`/story/<story-slug>`) and its React
key internally — use lowercase-with-hyphens (e.g. `the-lost-door`).

## story.json fields

```json
{
  "slug": "the-lost-door",
  "title": "The Lost Door",
  "author": "A.V. Shadow",
  "description": "One sentence hook — shown on cards, hero, search, SEO.",
  "genre": ["Horror", "Mystery"],
  "access": "premium",
  "featured": false,
  "freeChapters": 1,
  "priceInPaise": 4900,
  "rating": 4.8
}
```

| Field | Required | Notes |
|---|---|---|
| `slug` | optional | Falls back to the folder name if omitted. |
| `title` | yes | |
| `author` | recommended | Falls back to `"Pagewick"` if omitted. |
| `description` | yes | Used on cards, hero, story details, search index, and SEO meta tags. |
| `genre` | recommended | Array of strings. Powers genre rows and genre filtering. Omitting it just means the story won't appear in any genre row. |
| `access` | yes | `"free"` or `"premium"`. Only matters as a fallback when `freeChapters` isn't set (see below). |
| `featured` | optional | `true` puts it in the homepage hero. Leave `false`/omitted for a normal card — this is what keeps the homepage from being dominated by one story. |
| `freeChapters` | recommended | Integer. The first N chapters (by number) are free; the rest are locked behind Razorpay checkout. Omit it and the story falls back to fully-free (if `access: "free"`) or fully-locked (if `access: "premium"`). |
| `priceInPaise` | **required if any chapter is locked** | Integer, in paise. One of the three approved tiers: ₹29 = `2900`, ₹49 = `4900`, ₹99 = `9900`. If a premium story omits this, the Unlock button shows "price not set" and refuses to open checkout instead of breaking silently — but you still need to set it for the story to be purchasable. |
| `rating` | optional | A curated number you set yourself (e.g. from real reviews) — Pagewick has no backend to aggregate live user ratings in V1, so don't invent one; just omit the field if you don't have a real number, and the star display won't render. |

**Do not add a `characters` or `about` field unless you're writing real,
verified content yourself.** Both render automatically if present (see
`StoryDetails.jsx`), but Pagewick's own code will never generate or infer
character bios or plot summaries on your behalf.

## Chapters

- File name `chapter-<N>.md` — the number drives ordering (numeric, so
  `chapter-2` correctly sorts before `chapter-10`) and drives the
  free/locked split via `freeChapters`.
- The first line of the file, if it starts with `#`, becomes the chapter
  title (stripped from the displayed body). Everything after that is the
  chapter text.
- A line starting with `## ` renders as a section heading inside the
  chapter (used for in-chapter scene breaks). `**bold**` and `*italic*`
  are supported. `---` renders as a divider.
- The reader paginates this content automatically (`src/lib/paginate.js`)
  — you don't do anything to make "Page X of Y" work, it's computed from
  the chapter's length.

## Thumbnail

Any of `.jpg` / `.jpeg` / `.png` / `.webp` / `.svg` works — the loader
picks up whichever extension is present. If none exists, story cards fall
back to a text placeholder instead of breaking.

## What automatically happens once the folder exists

Homepage rows, Explore grid, genre pages, search (title/author/genre/
description), story details page, chapter list with free/locked badges,
the reader, Library (bookmarks + reading progress), the rating prompt, and
the Razorpay unlock button all pick up the new story with zero code
changes — this was true before this guide was written and remains true
now; nothing about the loader changed today except a safety check on
`priceInPaise`.

## Deploying a new story

1. Add the folder above under `src/content/stories/`.
2. Commit and push to GitHub.
3. Netlify's Git integration rebuilds and redeploys automatically — you
   don't manually trigger anything.

This is a build-time system (Vite bundles the content when the site is
built), not a live runtime fetch from GitHub. A push-triggered auto-deploy
takes about a minute and requires no code edits, which is why runtime
GitHub fetching isn't used here — it would add real complexity (async
loading states everywhere, GitHub API rate limits, CORS) for a benefit
(skipping a ~1 minute automatic rebuild) that doesn't exist in practice
with Netlify's Git integration already in place.

## Exclusive Content (optional, per story)

A story can optionally include a character showcase — original art,
optional short animation, optional dialogue — displayed on that story's own
details page (never on homepage/story-selection cards). This is completely
independent of the book itself: a story with no `exclusive` object in its
`story.json` shows nothing about this feature at all — no empty section, no
"coming soon," no placeholder. Nothing to remove or hide; it just isn't
there.

**Note on current status:** the *display* architecture below is built and
live. The *purchase flow* for Exclusive Content is not — the "Unlock
Exclusive Content" button is intentionally disabled for now. When that's
ready to build, it'll follow the same Razorpay pattern already used for
book purchases, as its own separate task.

### Folder structure

```
src/content/stories/<story-slug>/
  story.json
  thumbnail.*
  chapters/...
  exclusive/
    irene.png
    irene.mp4        (optional)
    iris.png
    ...
```

### story.json

```json
{
  "exclusive": {
    "enabled": true,
    "priceInPaise": 29900,
    "characters": [
      {
        "name": "Irene",
        "image": "exclusive/irene.png",
        "animation": "exclusive/irene.mp4",
        "dialogue": "Some reflections were waiting for someone to look back."
      },
      {
        "name": "Iris",
        "image": "exclusive/iris.png"
      }
    ]
  }
}
```

- `exclusive` — omit the whole object entirely for a story with no
  showcase. This is the default for every existing story.
- `enabled` — must be `true` for anything to render.
- `priceInPaise` — **completely separate from the book's own `priceInPaise`**.
  A story's book price and its Exclusive Content price are two unrelated
  numbers; neither is calculated from the other.
- `characters` — array, any length, any names. `image` is required per
  character; `animation` and `dialogue` are both optional independently of
  each other — a character can have art with no video, dialogue with no
  video, etc. Nothing about the component needs to change for any
  combination of these.

### Adding a character later

Add the image (and optionally video) file to that story's `exclusive/`
folder, add one entry to that story's `characters` array, push. No file
under `src/components/` or `src/lib/` is touched — `ExclusiveContent.jsx`
is generic and reads whatever `story.exclusive` contains, for any story.
