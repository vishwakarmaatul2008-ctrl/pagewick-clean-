import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Seo from '../components/Seo'
import StoryCard from '../components/StoryCard'
import { searchStories } from '../lib/stories'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const initialQuery = params.get('q') || ''
  const [query, setQuery] = useState(initialQuery)

  const results = searchStories(params.get('q') || '')

  function handleSubmit(e) {
    e.preventDefault()
    setParams(query.trim() ? { q: query.trim() } : {})
  }

  return (
    <div className="page container page-pad">
      <Seo title="Search" description="Search Pagewick's story catalogue." />
      <h1 className="page-title">Search</h1>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, genre, author..."
          aria-label="Search stories"
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {params.get('q') && (
        <p className="search-meta">
          {results.length} result{results.length === 1 ? '' : 's'} for "{params.get('q')}"
        </p>
      )}

      {params.get('q') && results.length === 0 ? (
        <div className="empty-state">
          <h2>No stories found</h2>
          <p>Try a different title, genre, or author.</p>
        </div>
      ) : (
        <div className="story-grid">
          {results.map((story) => (
            <StoryCard story={story} key={story.slug} />
          ))}
        </div>
      )}
    </div>
  )
}
