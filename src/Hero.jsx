import { Link } from 'react-router-dom'
import { getProgress } from '../lib/storage'
import RatingStars from './RatingStars'

export default function Hero({ story }) {
  if (!story) return null
  const progress = getProgress(story.slug)
  const continuing = progress && !progress.completed

  return (
    <section className="hero">
      <div className="hero-media">
        {story.thumbnailUrl ? (
          <img src={story.thumbnailUrl} alt="" aria-hidden="true" />
        ) : null}
        <div className="hero-scrim" />
      </div>
      <div className="container hero-content">
        <span className="eyebrow">Featured Story</span>
        <h1>{story.title}</h1>
        <div className="hero-tags">
          <span className={`seal ${story.hasLockedChapters ? '' : 'free'}`}>
            {story.hasLockedChapters ? 'Premium' : 'Free'}
          </span>
          <span className="hero-genre">{(story.genre || []).join(' · ')}</span>
          {story.rating && <RatingStars value={story.rating} />}
          <span className="hero-genre">
            {story.chapterCount} chapter{story.chapterCount === 1 ? '' : 's'}
          </span>
        </div>
        <p className="hero-desc">{story.description}</p>
        <div className="hero-actions">
          <Link to={`/story/${story.slug}`} className="btn btn-primary">
            {continuing ? 'Continue Reading' : 'Read Now'}
          </Link>
          <Link to={`/story/${story.slug}`} className="btn btn-ghost">
            More Details
          </Link>
        </div>
      </div>
    </section>
  )
}
