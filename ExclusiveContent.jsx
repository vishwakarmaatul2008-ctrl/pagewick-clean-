import { useState } from 'react'
import { isExclusiveUnlocked } from '../lib/storage'

// Fully generic: takes a story, reads story.exclusive, and renders nothing
// at all if that object is absent or not enabled. Never references any
// specific story or character name — every story (including future ones)
// uses this same component with zero code changes, driven entirely by
// that story's own story.json + exclusive/ folder.
//
// Purchasing isn't wired up yet (see PART 12 of the brief this was built
// from) — isExclusiveUnlocked() will currently always return false, so this
// renders the locked teaser state. That's intentional: the display
// architecture is being built now because it's inert until a story
// actually declares exclusive content; the payment flow is a distinct,
// separate task for when that's explicitly requested.
export default function ExclusiveContent({ story }) {
  const exclusive = story?.exclusive
  const [unlocked] = useState(() => (story ? isExclusiveUnlocked(story.slug) : false))

  if (!exclusive || !exclusive.enabled) return null
  if (!Array.isArray(exclusive.characters) || exclusive.characters.length === 0) return null

  const hasValidPrice = Number.isInteger(exclusive.priceInPaise) && exclusive.priceInPaise >= 100
  const hasAnyAnimation = exclusive.characters.some((c) => c.animationUrl)

  return (
    <div className="exclusive-section">
      <h2 className="section-title">Exclusive Character Showcase</h2>

      {!unlocked ? (
        <div className="exclusive-locked">
          <p className="exclusive-locked-copy">
            Original character art{hasAnyAnimation ? ', short animations,' : ''} and behind-the-scenes
            material for this story.
          </p>
          <button type="button" className="btn btn-wine" disabled>
            {hasValidPrice
              ? `Unlock Exclusive Content — ₹${(exclusive.priceInPaise / 100).toFixed(0)} (purchasing coming soon)`
              : 'Exclusive Content price not set'}
          </button>
        </div>
      ) : (
        <div className="exclusive-grid">
          {exclusive.characters.map((character) => (
            <div className="exclusive-card" key={character.name}>
              {character.imageUrl && (
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="exclusive-image"
                  loading="lazy"
                />
              )}
              {character.animationUrl && (
                <video
                  className="exclusive-video"
                  src={character.animationUrl}
                  controls
                  playsInline
                  preload="none"
                />
              )}
              <h3 className="exclusive-name">{character.name}</h3>
              {character.dialogue && (
                <p className="exclusive-dialogue">&ldquo;{character.dialogue}&rdquo;</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
