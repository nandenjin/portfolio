export function normalizeImagePathsInHtml(
  html: string,
  contentType: "works" | "events" | "news" | "profile",
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
    .replace(/<img([^>]*)\ssrc="\/profile\/([^"]+)"/g, (match, attrs, path) => {
      return `<img${attrs} src="/static/profile/${path}"`
    })
}
