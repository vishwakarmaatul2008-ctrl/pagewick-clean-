import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import StoryCard from '../components/StoryCard'
import { getStory } from '../lib/stories'
import { getAllProgress, getBookmarks, recordPurchase } from '../lib/storage'
import { restorePurchase } from '../lib/razorpay'

export default function Library() {
  const [bookmarkedStories, setBookmarkedStories] = useState([])
  const [progressStories, setProgressStories] = useState([])
  const [paymentIdInput, setPaymentIdInput] = useState('')
  const [restoring, setRestoring] = useState(false)
  const [restoreMessage, setRestoreMessage] = useState(null) // { type: 'success'|'error', text }

  useEffect(() => {
    const bookmarks = Object.keys(getBookmarks())
    const progress = getAllProgress()

    setBookmarkedStories(bookmarks.map(getStory).filter(Boolean))
    setProgressStories(
      Object.keys(progress)
        .map(getStory)
        .filter((s) => s && !progress[s.slug].completed)
    )
  }, [])

  const isEmpty = bookmarkedStories.length === 0 && progressStories.length === 0

  async function handleRestore(e) {
    e.preventDefault()
    const paymentId = paymentIdInput.trim()
    if (!paymentId) return

    setRestoring(true)
    setRestoreMessage(null)
    try {
      const result = await restorePurchase(paymentId)
      recordPurchase(result.storySlug, result.orderId, result.paymentId)
      const story = getStory(result.storySlug)
      setRestoreMessage({
        type: 'success',
        text: story
          ? `Restored — "${story.title}" is unlocked on this device now.`
          : 'Purchase restored on this device.',
      })
      setPaymentIdInput('')
    } catch (err) {
      setRestoreMessage({ type: 'error', text: err.message })
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div className="page container page-pad">
      <Seo title="Library" description="Your bookmarked stories and reading progress on this device." />
      <h1 className="page-title">Library</h1>
      <p className="page-subtitle">
        Bookmarks and reading progress are saved on this device only. Purchases are different —
        they're lifetime access to that story, and can be restored on a new device below using
        the Payment ID from your purchase.
      </p>

      {isEmpty ? (
        <div className="empty-state">
          <h2>Your library is empty</h2>
          <p>Bookmark a story or start reading to see it here.</p>
          <Link to="/explore" className="btn btn-primary" style={{ marginTop: 16 }}>
            Explore Stories
          </Link>
        </div>
      ) : (
        <>
          {progressStories.length > 0 && (
            <>
              <h2 className="section-title library-heading">Continue Reading</h2>
              <div className="story-grid">
                {progressStories.map((story) => (
                  <StoryCard story={story} key={story.slug} />
                ))}
              </div>
            </>
          )}

          {bookmarkedStories.length > 0 && (
            <>
              <h2 className="section-title library-heading">Bookmarked</h2>
              <div className="story-grid">
                {bookmarkedStories.map((story) => (
                  <StoryCard story={story} key={story.slug} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div className="restore-purchase">
        <p className="restore-purchase-label">
          Already bought a story on another device? Enter the Payment ID from your Razorpay
          receipt to restore access here.
        </p>
        <form className="restore-purchase-form" onSubmit={handleRestore}>
          <input
            type="text"
            placeholder="pay_XXXXXXXXXXXXXX"
            value={paymentIdInput}
            onChange={(e) => setPaymentIdInput(e.target.value)}
            aria-label="Razorpay Payment ID"
          />
          <button type="submit" className="btn btn-ghost" disabled={restoring || !paymentIdInput.trim()}>
            {restoring ? 'Checking…' : 'Restore'}
          </button>
        </form>
        {restoreMessage && (
          <p className={`restore-purchase-message ${restoreMessage.type}`}>{restoreMessage.text}</p>
        )}
      </div>
    </div>
  )
}
