export function normalizeThumbnailPath(
  thumbnail: string | null | undefined,
  contentType: "works" | "events" | "news",
  id: string,
): string | null {
  if (!thumbnail) return null

  // Already absolute path starting with /
  if (thumbnail.startsWith("/")) {
    // Replace content type prefix with /static/ prefix
    // e.g., /works/foo/bar.jpg -> /static/works/foo/bar.jpg
    return thumbnail.replace(/^\/(works|events|news)/, "/static/$1")
  }

  // Relative path - make it absolute based on content type
  return `/static/${contentType}/${id}/${thumbnail}`
}

export function normalizeImagePathsInHtml(
  html: string,
  contentType: "works" | "events" | "news",
  id: string,
): string {
  // Replace relative image paths in <img> tags
  return html
    .replace(
      /<img([^>]*)\ssrc="(?!https?:\/\/)(?!\/)([^"]+)"/g,
      (match, attrs, src) => {
        return `<img${attrs} src="/${contentType}/${id}/${src}"`
      },
    )
    .replace(
      // Also handle absolute paths that don't start with /static
      /<img([^>]*)\ssrc="\/(works|events|news)\/([^"]+)"/g,
      (match, attrs, type, path) => {
        return `<img${attrs} src="/static/${type}/${path}"`
      },
    )
}
