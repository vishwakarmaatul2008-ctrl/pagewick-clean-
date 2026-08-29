// Splits a chapter's content into "pages" for a page-by-page reading
// experience, without ever splitting a paragraph/quote/heading block across
// two pages. This is a simple character-budget packer — it doesn't measure
// real rendered height, but it approximates a comfortable phone screen of
// reading text per page, which is what matters for short, dialogue-heavy
// chapters like Pagewick's.

const TARGET_CHARS_PER_PAGE = 650

export default function paginateChapter(content) {
  const blocks = content
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)

  if (blocks.length === 0) return ['']

  const pages = []
  let current = []
  let currentLength = 0

  for (const block of blocks) {
    const blockLength = block.length

    if (current.length > 0 && currentLength + blockLength > TARGET_CHARS_PER_PAGE) {
      pages.push(current.join('\n\n'))
      current = []
      currentLength = 0
    }

    current.push(block)
    currentLength += blockLength
  }

  if (current.length > 0) {
    pages.push(current.join('\n\n'))
  }

  return pages
}
