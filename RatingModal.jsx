import { useState } from 'react'

export default function RatingModal({ storyTitle, onSubmit }) {
  const [value, setValue] = useState(0)
  const [hover, setHover] = useState(0)

  const display = hover || value

  return (
    <div className="rating-overlay" role="dialog" aria-modal="true" aria-label="Rate this story">
      <div className="rating-card">
        <span className="eyebrow">The End</span>
        <h2>How would you rate "{storyTitle}"?</h2>
        <p>Your rating helps shape what Pagewick brings you next.</p>
        <div className="rating-stars" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              className={`star-btn ${n <= display ? 'filled' : ''}`}
              onClick={() => setValue(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={value === 0}
          onClick={() => onSubmit(value)}
        >
          Submit Rating
        </button>
      </div>
    </div>
  )
}
