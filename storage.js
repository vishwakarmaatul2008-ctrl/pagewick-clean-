// ---------------------------------------------------------------------------
// Device-local persistence. Pagewick V1 has no accounts, so everything here
// lives in localStorage on the reader's own browser. This is intentionally
// NOT cloud sync.
// ---------------------------------------------------------------------------

// NOTE: key prefixes are intentionally left as "vellum:*" (the product's
// prior name) even after the Vellum -> Pagewick rename. Changing these
// strings would change the actual localStorage keys, which would silently
// wipe every existing visitor's bookmarks, reading progress, ratings, and —
// critically — their recorded Razorpay purchases, re-locking chapters
// people already paid for. Not worth it for an invisible internal label.
const KEYS = {
  bookmarks: 'vellum:bookmarks', // { [slug]: true }
  progress: 'vellum:progress', // { [slug]: { chapterSlug, chapterNumber, updatedAt } }
  ratings: 'vellum:ratings', // { [slug]: { value, ratedAt } }
  purchases: 'vellum:purchases', // { [slug]: { orderId, paymentId, unlockedAt } }
  exclusivePurchases: 'vellum:exclusive-purchases', // { [slug]: { orderId, paymentId, unlockedAt } }
}

function safeGet(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// ---------------- bookmarks ----------------

export function getBookmarks() {
  return safeGet(KEYS.bookmarks, {})
}

export function isBookmarked(slug) {
  return !!getBookmarks()[slug]
}

export function toggleBookmark(slug) {
  const current = getBookmarks()
  if (current[slug]) {
    delete current[slug]
  } else {
    current[slug] = true
  }
  safeSet(KEYS.bookmarks, current)
  return !!current[slug]
}

// ---------------- reading progress ----------------

export function getAllProgress() {
  return safeGet(KEYS.progress, {})
}

export function getProgress(slug) {
  return getAllProgress()[slug] || null
}

export function setProgress(slug, chapterSlug, chapterNumber, totalChapters) {
  const all = getAllProgress()
  all[slug] = {
    chapterSlug,
    chapterNumber,
    totalChapters,
    updatedAt: Date.now(),
    completed: chapterNumber >= totalChapters,
  }
  safeSet(KEYS.progress, all)
}

export function clearProgress(slug) {
  const all = getAllProgress()
  delete all[slug]
  safeSet(KEYS.progress, all)
}

// ---------------- ratings ----------------

export function getRating(slug) {
  return safeGet(KEYS.ratings, {})[slug] || null
}

export function hasRated(slug) {
  return !!getRating(slug)
}

export function submitRating(slug, value) {
  const all = safeGet(KEYS.ratings, {})
  all[slug] = { value, ratedAt: Date.now() }
  safeSet(KEYS.ratings, all)
}

// ---------------- purchases (Razorpay unlocks) ----------------
// Payment itself is verified server-side (see /api/verify-payment). This
// only records the *result* of a verified purchase, on-device, so a locked
// story stays unlocked on return visits — same no-account model as
// bookmarks/progress/ratings above.

export function isStoryUnlocked(slug) {
  return !!safeGet(KEYS.purchases, {})[slug]
}

export function recordPurchase(slug, orderId, paymentId) {
  const all = safeGet(KEYS.purchases, {})
  all[slug] = { orderId, paymentId, unlockedAt: Date.now() }
  safeSet(KEYS.purchases, all)
}

// Used to show the buyer their own Payment ID after unlocking — that ID is
// what they'd need to restore access on another device later.
export function getPurchaseRecord(slug) {
  return safeGet(KEYS.purchases, {})[slug] || null
}

// ---------------- Exclusive Content purchases (separate product, separate unlock state) ----------------
// A book purchase and an Exclusive Content purchase are intentionally
// tracked independently — owning one never implies owning the other. No
// purchase flow calls recordExclusiveUnlock yet (Exclusive Content payment
// isn't wired up); these exist so the "separate unlock state" architecture
// is in place before that's built, not to unlock anything today.

export function isExclusiveUnlocked(slug) {
  return !!safeGet(KEYS.exclusivePurchases, {})[slug]
}

export function recordExclusiveUnlock(slug, orderId, paymentId) {
  const all = safeGet(KEYS.exclusivePurchases, {})
  all[slug] = { orderId, paymentId, unlockedAt: Date.now() }
  safeSet(KEYS.exclusivePurchases, all)
}

// ---------------- library aggregation ----------------

export function getLibrarySlugs() {
  const bookmarked = Object.keys(getBookmarks())
  const inProgress = Object.keys(getAllProgress())
  return Array.from(new Set([...bookmarked, ...inProgress]))
}
