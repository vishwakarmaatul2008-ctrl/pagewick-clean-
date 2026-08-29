import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ChapterText from '../components/ChapterText'
import RatingModal from '../components/RatingModal'
import Seo from '../components/Seo'
import paginateChapter from '../lib/paginate'
import { getStory } from '../lib/stories'
import {
  hasRated,
  isBookmarked,
  isStoryUnlocked,
  setProgress,
  submitRating,
  toggleBookmark,
} from '../lib/storage'

export default function Reader() {
  const { slug, chapterSlug } = useParams()
  const navigate = useNavigate()
  const story = getStory(slug)
  const [bookmarked, setBookmarked] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [showRating, setShowRating] = useState(false)
  // Lazy-init so a returning purchaser doesn't see a locked-page flash.
  const [unlocked, setUnlocked] = useState(() => (story ? isStoryUnlocked(story.slug) : false))

  const chapterIndex = story
    ? story.chapters.findIndex((c) => c.slug === chapterSlug)
    : -1
  const chapter = chapterIndex >= 0 ? story.chapters[chapterIndex] : null
  const isLastChapter = story && chapterIndex === story.chapters.length - 1
  const nextChapter = story && !isLastChapter ? story.chapters[chapterIndex + 1] : null
  const prevChapter = story && chapterIndex > 0 ? story.chapters[chapterIndex - 1] : null

  const chapterLocked = !!chapter && chapter.locked && !unlocked
  const prevLocked = !!prevChapter && prevChapter.locked && !unlocked
  const nextLocked = !!nextChapter && nextChapter.locked && !unlocked

  const pages = useMemo(
    () => (chapter && !chapterLocked ? paginateChapter(chapter.content) : []),
    [chapter, chapterLocked]
  )
  const totalPages = pages.length
  const isLastPage = pageIndex >= totalPages - 1

  // Reset to page 1 whenever the chapter changes, and record progress at the
  // chapter level (unchanged from before — only the in-chapter navigation is
  // page-by-page).
  useEffect(() => {
    if (!story) return
    setUnlocked(isStoryUnlocked(story.slug))
  }, [story?.slug])

  useEffect(() => {
    if (!story || !chapter || chapterLocked) return
    setBookmarked(isBookmarked(story.slug))
    setProgress(story.slug, chapter.slug, chapter.number, story.chapterCount)
    setPageIndex(0)
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.slug, chapter?.slug, chapterLocked])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pageIndex])

  if (!story) return <Navigate to="/explore" replace />
  if (!chapter) return <Navigate to={`/story/${story.slug}`} replace />

  if (chapterLocked) {
    return (
      <div className="page container page-pad reader-locked">
        <Seo title={`${chapter.title} — Locked`} />
        <div className="empty-state">
          <h2>Chapter {chapter.number} is locked</h2>
          <p>"{chapter.title}" is part of the premium chapters. Unlock the story to read it.</p>
          <Link to={`/story/${story.slug}`} className="btn btn-primary" style={{ marginTop: 16 }}>
            Back to Story
          </Link>
        </div>
      </div>
    )
  }

  function handleBookmark() {
    setBookmarked(toggleBookmark(story.slug))
  }

  function handleRatingSubmit(value) {
    submitRating(story.slug, value)
    setShowRating(false)
  }

  function goPrev() {
    if (pageIndex > 0) {
      setPageIndex((p) => p - 1)
      return
    }
    if (prevChapter && !prevLocked) {
      navigate(`/story/${story.slug}/read/${prevChapter.slug}`)
    }
  }

  function goNext() {
    if (!isLastPage) {
      setPageIndex((p) => p + 1)
      return
    }
    // Last page of this chapter.
    if (nextChapter && !nextLocked) {
      navigate(`/story/${story.slug}/read/${nextChapter.slug}`)
      return
    }
    if (isLastChapter) {
      if (!hasRated(story.slug)) {
        setShowRating(true)
      } else {
        navigate(`/story/${story.slug}`)
      }
    }
  }

  const canGoPrev = pageIndex > 0 || (prevChapter && !prevLocked)
  const nextIsLockedChapter = isLastPage && nextChapter && nextLocked
  const nextLabel = !isLastPage
    ? 'Next'
    : nextIsLockedChapter
    ? 'Locked 🔒'
    : isLastChapter
    ? 'Finish Story'
    : 'Next Chapter'

  return (
    <div className="page reader">
      <Seo title={`${chapter.title} — ${story.title}`} description={story.description} />

      <div className="reader-topbar container">
        <Link to={`/story/${story.slug}`} className="reader-back">
          ← {story.title}
        </Link>
        <button
          type="button"
          className={`btn btn-ghost btn-sm ${bookmarked ? 'bookmarked' : ''}`}
          onClick={handleBookmark}
        >
          {bookmarked ? 'Bookmarked ✓' : 'Bookmark'}
        </button>
      </div>

      <div className="reader-chapter-head container">
        <p className="reader-progress-label">Chapter {chapter.number}</p>
        <h1 className="reader-chapter-title">{chapter.title}</h1>
      </div>

      <article className="container reader-content">
        <ChapterText content={pages[pageIndex] || ''} />
      </article>

      <div className="reader-nav container">
        <button type="button" className="btn btn-ghost" disabled={!canGoPrev} onClick={goPrev}>
          ← Prev
        </button>
        <span className="reader-page-count">
          Page {totalPages ? pageIndex + 1 : 0} of {totalPages}
        </span>
        <button
          type="button"
          className="btn btn-primary"
          disabled={nextIsLockedChapter}
          onClick={goNext}
        >
          {nextLabel} →
        </button>
      </div>

      <div className="reader-chapterlist-link container">
        <Link to={`/story/${story.slug}`}>Chapter List</Link>
      </div>

      {showRating && (
        <RatingModal storyTitle={story.title} onSubmit={handleRatingSubmit} />
      )}
    </div>
  )
}
