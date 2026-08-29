import { Link } from 'react-router-dom'
import { getProgress, isBookmarked } from '../lib/storage'

export default function StoryCard({ story }) {
  const progress = getProgress(story.slug)
  const bookmarked = isBookmarked(story.slug)
  const showRibbon = bookmarked || (progress && !progress.completed)

  return (
    <Link to={`/story/${story.slug}`} className="story-card" aria-label={story.title}>
      <div className="story-card-thumb">
        {showRibbon && (
          <span
            className={`ribbon ${bookmarked ? '' : 'wine'}`}
            title={bookmarked ? 'Bookmarked' : 'Continue reading'}
          />
        )}
        {story.thumbnailUrl ? (
          <img src={story.thumbnailUrl} alt={story.title} loading="lazy" />
        ) : (
          <div className="thumb-fallback">{story.title}</div>
        )}
        <span className={`seal card-seal ${story.hasLockedChapters ? '' : 'free'}`}>
          {story.hasLockedChapters ? 'Premium' : 'Free'}
        </span>
        {progress && !progress.completed && (
          <div className="card-progress-track">
            <div
              className="card-progress-fill"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((progress.chapterNumber / progress.totalChapters) * 100)
                )}%`,
              }}
            />
          </div>
        )}
      </div>
      <div className="story-card-meta">
        <h3>{story.title}</h3>
        <p>{(story.genre || []).join(' · ')}</p>
      </div>
    </Link>
  )
}
