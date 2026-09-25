import { readdir, readFile } from "fs/promises"
import { join } from "path"
import MarkdownIt from "markdown-it"
import type { Item } from "../src/types/content"
import { extractJsonLdScript, withBodyHtmlAdditionalProperty } from "./jsonld"

const md = new MarkdownIt({ html: true })

/**
 * Slugs that cannot be used for items, because the item would be served at
 * `/<slug>` on the API or on the site and collide with another route.
 */
export const RESERVED_SLUGS = new Set([
  // API
  "health",
  "static",
  "cdn-cgi",
  // Site: section indexes and redirects of old URLs
  "works",
  "events",
  "news",
  "profile",
  "sitemap.xml",
])

/**
 * Parses every `items/<slug>/index.md` into an item.
 *
 * @param baseDir - Repository root holding `items/`.
 * @throws If an item has no JSON-LD or uses a reserved slug.
 */
export async function parseItems(baseDir: string): Promise<Item[]> {
  const itemsDir = join(baseDir, "items")
  const dirs = await readdir(itemsDir, { withFileTypes: true })

  const items: Item[] = []

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue

    const id = dir.name
    if (RESERVED_SLUGS.has(id)) {
      throw new Error(`items/${id} uses a reserved slug`)
    }

    const content = await readFile(join(itemsDir, id, "index.md"), "utf-8")
    const { jsonld: extractedJsonLd, contentWithoutJsonLd } =
      extractJsonLdScript(content)

    if (!extractedJsonLd) {
      throw new Error(`Missing JSON-LD script in items/${id}/index.md`)
    }

    // Convert markdown to HTML
    const bodyHtml = md.render(contentWithoutJsonLd)

    items.push({
      id,
      jsonld: withBodyHtmlAdditionalProperty(extractedJsonLd, bodyHtml),
      body_html: bodyHtml,
    })
  }

  return items
}
