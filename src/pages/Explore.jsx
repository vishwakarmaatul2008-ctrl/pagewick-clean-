import Seo from '../components/Seo'
import StoryCard from '../components/StoryCard'
import { getAllStories } from '../lib/stories'

export default function Explore() {
  const stories = getAllStories()

  return (
    <div className="page container page-pad">
      <Seo title="Explore" description="Browse every story on Pagewick." />
      <h1 className="page-title">Explore</h1>

      {stories.length === 0 ? (
        <div className="empty-state">
          <h2>Nothing here yet</h2>
          <p>Stories you publish will appear in this grid automatically.</p>
        </div>
      ) : (
        <div className="story-grid">
          {stories.map((story) => (
            <StoryCard story={story} key={story.slug} />
          ))}
        </div>
      )}
    </div>
  )
}
