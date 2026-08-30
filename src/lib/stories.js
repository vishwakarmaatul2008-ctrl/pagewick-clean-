// ---------------------------------------------------------------------------
// Dynamic story catalogue.
//
// This file is the ONLY place that knows how stories are discovered.
// Nothing else in the app (pages, cards, routing, search, genres) hardcodes
// a story. To publish a new story: add a folder under src/content/stories/
// with story.json, thumbnail.(jpg|png|webp|svg) and chapters/chapter-N.md —
// nothing here needs to change.
// ---------------------------------------------------------------------------

// Eagerly import every story.json so metadata is available synchronously.
const metaModules = import.meta.glob('../content/stories/*/story.json', {
  eager: true,
})

// Eagerly import every thumbnail so Vite can fingerprint/bundle it and hand
// back a usable URL.
const thumbModules = import.meta.glob(
  '../content/stories/*/thumbnail.{jpg,jpeg,png,webp,svg}',
  { eager: true, import: 'default' }
)

// Exclusive Content assets (character art/animations) — same pattern as
// thumbnails: any file under a story's exclusive/ folder gets bundled and
// gets a real URL. A story's story.json declares which files it uses (see
// resolveExclusiveAsset below); this glob just makes every such file
// available to be matched against.
const exclusiveModules = import.meta.glob(
  '../content/stories/*/exclusive/*.{png,jpg,jpeg,webp,mp4,webm}',
  { eager: true, import: 'default' }
)

// Chapters are loaded as raw markdown text, lazily is unnecessary for a
// text-only app, so we eager-load them too — they are small.
const chapterModules = import.meta.glob('../content/stories/*/chapters/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function slugFromPath(path) {
  const match = path.match(/content\/stories\/([^/]+)\//)
  return match ? match[1] : null
}

function chapterNumberFromPath(path) {
  const match = path.match(/chapter-(\d+)\.md$/i)
  return match ? parseInt(match[1], 10) : 0
}

function chapterSlugFromPath(path) {
  const match = path.match(/([^/]+)\.md$/i)
  return match ? match[1] : path
}

// Resolves a story.json-declared relative path (e.g. "exclusive/irene.png")
// to the actual bundled asset URL for that specific story. Generic — works
// for any filename, any story, any number of characters, with zero changes
// needed here when new ones are added.
function resolveExclusiveAsset(slug, relativePath) {
  if (!relativePath) return undefined
  const cleaned = relativePath.replace(/^\.?\//, '')
  const suffix = `content/stories/${slug}/${cleaned}`
  const foundKey = Object.keys(exclusiveModules).find((key) => key.endsWith(suffix))
  return foundKey ? exclusiveModules[foundKey] : undefined
}

function buildCatalogue() {
  const bySlug = {}

  for (const [path, mod] of Object.entries(metaModules)) {
    const slug = slugFromPath(path)
    if (!slug) continue
    const meta = mod.default ?? mod
    bySlug[slug] = { ...meta, slug: meta.slug || slug }
  }

  for (const [path, thumbUrl] of Object.entries(thumbModules)) {
    const slug = slugFromPath(path)
    if (slug && bySlug[slug]) {
      bySlug[slug].thumbnailUrl = thumbUrl
    }
  }

  for (const [path, raw] of Object.entries(chapterModules)) {
    const slug = slugFromPath(path)
    if (!slug || !bySlug[slug]) continue
    if (!bySlug[slug].chapters) bySlug[slug].chapters = []

    const lines = String(raw).split('\n')
    let title = ''
    let bodyStart = 0
    if (lines[0] && lines[0].trim().startsWith('#')) {
      title = lines[0].replace(/^#+\s*/, '').trim()
      bodyStart = 1
    }
    const body = lines.slice(bodyStart).join('\n').trim()

    bySlug[slug].chapters.push({
      number: chapterNumberFromPath(path),
      slug: chapterSlugFromPath(path),
      title: title || `Chapter ${chapterNumberFromPath(path)}`,
      content: body,
    })
  }

  // Sort chapters numerically (not alphabetically) within each story, and
  // resolve per-chapter free/locked status.
  //
  // A story can set "freeChapters": N in story.json — the first N chapters
  // (by number) are free, the rest are locked/premium. This is what powers
  // the future paywall UI. If freeChapters isn't set, we fall back to the
  // story-level "access" field for backward compatibility: "free" unlocks
  // every chapter, anything else locks every chapter.
  for (const story of Object.values(bySlug)) {
    if (story.chapters) {
      story.chapters.sort((a, b) => a.number - b.number)
    } else {
      story.chapters = []
    }
    story.chapterCount = story.chapters.length

    const freeChapters =
      typeof story.freeChapters === 'number'
        ? story.freeChapters
        : story.access === 'free'
        ? story.chapters.length
        : 0

    for (const chapter of story.chapters) {
      chapter.locked = chapter.number > freeChapters
    }

    story.hasLockedChapters = story.chapters.some((c) => c.locked)

    // Exclusive Content is entirely optional per story. If story.json has
    // no "exclusive" object, or "enabled" isn't true, this block does
    // nothing and story.exclusive stays exactly whatever the JSON had
    // (usually undefined) — the UI treats that as "nothing to show."
    if (story.exclusive && story.exclusive.enabled && Array.isArray(story.exclusive.characters)) {
      story.exclusive = {
        ...story.exclusive,
        characters: story.exclusive.characters.map((character) => ({
          ...character,
          imageUrl: resolveExclusiveAsset(story.slug, character.image),
          animationUrl: resolveExclusiveAsset(story.slug, character.animation),
        })),
      }
    }
  }

  return bySlug
}

const catalogue = buildCatalogue()

export function getAllStories() {
  return Object.values(catalogue).sort((a, b) =>
    (a.title || '').localeCompare(b.title || '')
  )
}

export function getStory(slug) {
  return catalogue[slug] || null
}

export function getFeaturedStories() {
  return getAllStories().filter((s) => s.featured)
}

export function getStoriesByGenre(genre) {
  const target = genre.toLowerCase()
  return getAllStories().filter((s) =>
    (s.genre || []).some((g) => g.toLowerCase() === target)
  )
}

export function getAllGenres() {
  const set = new Set()
  for (const story of getAllStories()) {
    for (const g of story.genre || []) set.add(g)
  }
  return Array.from(set).sort()
}

export function searchStories(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return getAllStories().filter((s) => {
    const haystack = [
      s.title,
      s.author,
      s.description,
      ...(s.genre || []),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

export function getChapter(slug, chapterSlug) {
  const story = getStory(slug)
  if (!story) return null
  return story.chapters.find((c) => c.slug === chapterSlug) || null
}
