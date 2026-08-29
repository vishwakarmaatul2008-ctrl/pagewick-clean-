import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    }
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <img src="/pagewick-icon.png" alt="" className="brand-icon" />
          PAGEWICK
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <Link to="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link to="/explore" onClick={() => setOpen(false)}>
            Explore
          </Link>
          <Link to="/genres" onClick={() => setOpen(false)}>
            Genres
          </Link>
          <Link to="/library" onClick={() => setOpen(false)}>
            Library
          </Link>
          <form className="nav-search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="Search stories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search stories"
            />
          </form>
        </nav>

        <button
          type="button"
          className="nav-search-btn"
          aria-label="Search stories"
          onClick={() => navigate('/search')}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
