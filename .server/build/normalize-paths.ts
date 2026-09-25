import { resolveContentLinks } from "./jsonld"

/**
 * Rewrites repository paths in an item's HTML into public paths.
 *
 * - Relative `<img src>` → `/items/<id>/...`
 * - `<img src="/items/...">` → `/static/items/...`
 * - `<a href="/items/<slug>/index.md">` → `/<slug>` (see `resolveContentLinks`)
 */
export function normalizeImagePathsInHtml(html: string, id: string): string {
  return html
    .replace(
      // Relative image paths
      /<img([^>]*)\ssrc="(?!https?:\/\/)(?!\/)(?:\.\/)?([^"]+)"/g,
      (_match, attrs, src) => `<img${attrs} src="/items/${id}/${src}"`,
    )
    .replace(
      // Images under items/ are served from /static
      /<img([^>]*)\ssrc="\/items\/([^"]+)"/g,
      (_match, attrs, path) => `<img${attrs} src="/static/items/${path}"`,
    )
    .replace(
      /(<a\b[^>]*\shref=")(\/items\/[^"]+)"/g,
      (_match, pre, href) => `${pre}${resolveContentLinks(href)}"`,
    )
}
