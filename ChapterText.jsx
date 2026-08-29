// A deliberately small markdown renderer. Chapter content is prose, so this
// only needs to handle paragraphs, headings, blockquotes, and inline
// bold/italic — not a full CommonMark implementation.

function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={`${keyPrefix}-${i}`}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

export default function ChapterText({ content }) {
  const blocks = content.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)

  return (
    <div className="chapter-text">
      {blocks.map((block, i) => {
        if (block.startsWith('### ')) {
          return <h4 key={i}>{renderInline(block.slice(4), i)}</h4>
        }
        if (block.startsWith('## ')) {
          return <h3 key={i}>{renderInline(block.slice(3), i)}</h3>
        }
        if (block.startsWith('> ')) {
          return (
            <blockquote key={i}>
              {renderInline(block.replace(/^> ?/gm, ''), i)}
            </blockquote>
          )
        }
        if (block === '---' || block === '***') {
          return <hr key={i} />
        }
        return <p key={i}>{renderInline(block, i)}</p>
      })}
    </div>
  )
}
