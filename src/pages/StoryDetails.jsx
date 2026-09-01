import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import RatingStars from '../components/RatingStars'
import ExclusiveContent from '../components/ExclusiveContent'
import { getStory } from '../lib/stories'
import {
  getProgress,
  getPurchaseRecord,
  isBookmarked,
  isStoryUnlocked,
  recordPurchase,
  toggleBookmark,
} from '../lib/storage'
import { openUnlockCheckout } from '../lib/razorpay'

export default function StoryDetails() {
  const { slug } = useParams()
  const story = getStory(slug)
  const [bookmarked, setBookmarked] = useState(false)
  const [progress, setProgress] = useState(null)
  // Lazy-init from localStorage so a returning purchaser doesn't see a
  // locked-state flash before the effect below runs.
  const [unlocked, setUnlocked] = useState(() => (story ? isStoryUnlocked(story.slug) : false))
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  useEffect(() => {
    if (!story) return
    setBookmarked(isBookmarked(story.slug))
    setProgress(getProgress(story.slug))
    setUnlocked(isStoryUnlocked(story.slug))
  }, [story])

  if (!story) return <Navigate to="/explore" replace />

  const firstAccessibleChapter = unlocked
    ? story.chapters[0]
    : story.chapters.find((c) => !c.locked)
  const continuing = progress && !progress.completed
  const showUnlockButton = story.hasLockedChapters && !unlocked
  const hasValidPrice = Number.isInteger(story.priceInPaise) && story.priceInPaise >= 100

  function handleBookmark() {
    setBookmarked(toggleBookmark(story.slug))
  }

  function handleUnlock() {
    if (!hasValidPrice) {
      setPayError('This story is missing a valid price in its story.json (priceInPaise) — checkout cannot start.')
      return
    }
    setPayError('')
    setPaying(true)
    openUnlockCheckout({
      story,
      onSuccess: (response) => {
        recordPurchase(story.slug, response.razorpay_order_id, response.razorpay_payment_id)
        setUnlocked(true)
        setPaying(false)
      },
      onError: (message) => {
        setPayError(message)
        setPaying(false)
      },
      onCancel: () => {
        setPaying(false)
      },
    })
  }

  return (
    <div className="page">
      <Seo title={story.title} description={story.description} />

      <div className="details-hero">
        {story.thumbnailUrl && <img src={story.thumbnailUrl} alt="" aria-hidden="true" />}
        <div className="details-hero-scrim" />
      </div>

      <div className="container details-body">
        <div className="details-cover">
          {story.thumbnailUrl ? (
            <img src={story.thumbnailUrl} alt={story.title} />
          ) : (
            <div className="thumb-fallback">{story.title}</div>
          )}
        </div>

        <div className="details-info">
          <span className={`seal ${story.hasLockedChapters ? '' : 'free'}`}>
            {story.hasLockedChapters ? 'Premium' : 'Free'}
          </span>
          <h1>{story.title}</h1>
          <p className="details-byline">
            by {story.author || 'Pagewick'} · {(story.genre || []).join(' · ')} ·{' '}
            {story.chapterCount} chapter{story.chapterCount === 1 ? '' : 's'}
          </p>

          {story.rating && (
            <div className="details-rating">
              <RatingStars value={story.rating} />
            </div>
          )}

          <p className="details-desc">{story.description}</p>

          {progress && (
            <p className="details-progress-label">
              {progress.completed
                ? 'You\u2019ve finished this story.'
                : `Chapter ${progress.chapterNumber} of ${progress.totalChapters}`}
            </p>
          )}

          {unlocked && story.hasLockedChapters && (
            <div className="details-progress-label">
              <p style={{ margin: 0 }}>Unlocked ✓ — full story available</p>
              {getPurchaseRecord(story.slug)?.paymentId && (
                <p className="purchase-id-note">
                  Save this Payment ID to restore access on another device:{' '}
                  <code>{getPurchaseRecord(story.slug).paymentId}</code>
                </p>
              )}
            </div>
          )}

          <div className="details-actions">
            {firstAccessibleChapter ? (
              <Link
                to={`/story/${story.slug}/read/${
                  continuing ? progress.chapterSlug : firstAccessibleChapter.slug
                }`}
                className="btn btn-primary"
              >
                {continuing ? 'Continue Reading' : 'Start Reading'}
              </Link>
            ) : (
              <button type="button" className="btn btn-primary" disabled>
                No free chapters yet
              </button>
            )}

            {showUnlockButton && (
              <button
                type="button"
                className="btn btn-wine"
                onClick={handleUnlock}
                disabled={paying || !hasValidPrice}
              >
                {paying
                  ? 'Opening checkout…'
                  : hasValidPrice
                  ? `Unlock Story — ₹${(story.priceInPaise / 100).toFixed(0)}`
                  : 'Unlock Story — price not set'}
              </button>
            )}

            <button
              type="button"
              className={`btn btn-ghost ${bookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmark}
            >
              {bookmarked ? 'Bookmarked ✓' : 'Bookmark'}
            </button>
          </div>

          {payError && <p className="pay-error">{payError}</p>}

          {showUnlockButton && (
            <p className="details-premium-note">
              Secure payment powered by Razorpay.
            </p>
          )}

          {story.about && (
            <div className="details-section">
              <h2 className="section-title">About the Story</h2>
              <p>{story.about}</p>
            </div>
          )}

          {story.characters && story.characters.length > 0 && (
            <div className="details-section">
              <h2 className="section-title">Characters</h2>
              <ul className="character-list">
                {story.characters.map((c) => (
                  <li key={c.name}>
                    <strong>{c.name}</strong>
                    <span>{c.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {story.chapters.length > 0 && (
            <div className="chapter-list">
              <h2 className="section-title">Chapters</h2>
              <ol>
                {story.chapters.map((ch) => {
                  const accessible = !ch.locked || unlocked
                  return accessible ? (
                    <li key={ch.slug}>
                      <Link to={`/story/${story.slug}/read/${ch.slug}`} className="chapter-row">
                        <span>
                          <span className="chapter-num">{ch.number}.</span> {ch.title}
                        </span>
                        <span className="chapter-status free">
                          {ch.locked ? 'Unlocked' : 'Free'} <span aria-hidden="true">▶</span>
                        </span>
                      </Link>
                    </li>
                  ) : (
                    <li key={ch.slug} className="chapter-locked">
                      <span className="chapter-row">
                        <span>
                          <span className="chapter-num">{ch.number}.</span> {ch.title}
                        </span>
                        <span className="chapter-status locked">
                          Locked <span aria-hidden="true">🔒</span>
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}

          <ExclusiveContent story={story} />
        </div>
      </div>
    </div>
  )
}
