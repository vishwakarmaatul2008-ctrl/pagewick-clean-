import Hero from '../components/Hero'
import Row from '../components/Row'
import Seo from '../components/Seo'
import { getAllGenres, getAllStories, getFeaturedStories, getStoriesByGenre } from '../lib/stories'

export default function Home() {
  const all = getAllStories()
  const featured = getFeaturedStories()
  const heroStory = featured[0] || null
  const genres = getAllGenres()

  return (
    <div className="page">
      <Seo
        title={undefined}
        description="Pagewick is a premium story reading platform. Discover horror, mystery, romance, fantasy and more — no signup required."
      />

      {heroStory && <Hero story={heroStory} />}

      {all.length === 0 && (
        <div className="empty-state">
          <h2>No stories yet</h2>
          <p>Add a story folder under src/content/stories to see it here.</p>
        </div>
      )}

      {featured.length > 0 && <Row title="Featured Stories" stories={featured} />}
      <Row title="Trending Now" stories={all} />

      {genres.map((genre) => (
        <Row key={genre} title={genre} stories={getStoriesByGenre(genre)} />
      ))}
    </div>
  )
}
