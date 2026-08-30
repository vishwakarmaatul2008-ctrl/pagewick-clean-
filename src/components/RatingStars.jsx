export default function RatingStars({ value }) {
  if (!value) return null
  const rounded = Math.round(value * 2) / 2

  return (
    <span className="rating-display" aria-label={`Rated ${value} out of 5`}>
      <span className="rating-stars-static" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= rounded ? 'filled' : ''}>
            ★
          </span>
        ))}
      </span>
      <span className="rating-value">{value.toFixed(1)}</span>
    </span>
  )
}
