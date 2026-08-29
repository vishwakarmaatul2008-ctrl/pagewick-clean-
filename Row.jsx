import StoryCard from './StoryCard'

export default function Row({ title, stories }) {
  if (!stories || stories.length === 0) return null

  return (
    <section className="row" aria-label={title}>
      <div className="container row-head">
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="row-scroll">
        {stories.map((story) => (
          <div className="row-item" key={story.slug}>
            <StoryCard story={story} />
          </div>
        ))}
      </div>
    </section>
  )
}
