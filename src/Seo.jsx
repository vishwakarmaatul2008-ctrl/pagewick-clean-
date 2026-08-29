import { useEffect } from 'react'

function setMeta(name, content, attr = 'name') {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function Seo({ title, description }) {
  useEffect(() => {
    const fullTitle = title ? `${title} — Pagewick` : 'Pagewick — Stories worth staying up for'
    document.title = fullTitle
    if (description) {
      setMeta('description', description)
      setMeta('og:title', fullTitle, 'property')
      setMeta('og:description', description, 'property')
    }
  }, [title, description])

  return null
}
