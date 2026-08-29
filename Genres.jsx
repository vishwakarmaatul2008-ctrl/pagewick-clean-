import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { getAllGenres, getStoriesByGenre } from '../lib/stories'

export default function Genres() {
  const genres = getAllGenres()

  return (
    <div className="page container page-pad">
      <Seo title="Genres" description="Browse Pagewick stories by genre." />
      <h1 className="page-title">Genres</h1>

      {genres.length === 0 ? (
        <div className="empty-state">
          <h2>No genres yet</h2>
        </div>
      ) : (
        <div className="genre-grid">
          {genres.map((genre) => (
            <Link to={`/genres/${encodeURIComponent(genre.toLowerCase())}`} key={genre} className="genre-tile">
              <span>{genre}</span>
              <small>{getStoriesByGenre(genre).length} stories</small>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
