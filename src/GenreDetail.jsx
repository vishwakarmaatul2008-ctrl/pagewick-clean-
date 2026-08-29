import { useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import StoryCard from '../components/StoryCard'
import { getAllGenres, getStoriesByGenre } from '../lib/stories'

export default function GenreDetail() {
  const { genre } = useParams()
  const properGenre =
    getAllGenres().find((g) => g.toLowerCase() === genre.toLowerCase()) || genre
  const stories = getStoriesByGenre(properGenre)

  return (
    <div className="page container page-pad">
      <Seo title={properGenre} description={`Browse ${properGenre} stories on Pagewick.`} />
      <h1 className="page-title">{properGenre}</h1>

      {stories.length === 0 ? (
        <div className="empty-state">
          <h2>No stories found</h2>
          <p>There are no {properGenre} stories on Pagewick yet.</p>
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
