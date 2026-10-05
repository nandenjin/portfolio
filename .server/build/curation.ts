import { readFile } from "node:fs/promises"
import { join } from "node:path"
import MarkdownIt from "markdown-it"
import type { Item } from "../src/types/content"

const md = new MarkdownIt()

/** `/items/foo/index.md` */
const ITEM_LINK_RE = /^\/items\/([^/?#]+)\/index\.md$/

// Same rule as the frontend's `kindOf` (kzmi.jp: src/api/kind.ts)
const NEWS_TYPES = new Set(["NewsArticle", "Article", "BlogPosting"])
const ABOUT_TYPES = new Set(["Person", "ProfilePage", "AboutPage"])

/**
 * Tells whether an item is shown as a work: anything that is not an event,
 * an article or a person.
 */
export function isWork(item: Item): boolean {
  const type = item.jsonld["@type"]
  return !(
    NEWS_TYPES.has(type) ||
    ABOUT_TYPES.has(type) ||
    type.endsWith("Event")
  )
}

/**
 * Reads the featured works from `works.md`: the item links in the order they
 * appear. Works not in the file are unlisted.
 *
 * @param baseDir - Repository root holding `works.md`.
 * @param items - Parsed items, to check the links against.
 * @returns Ids of the featured works, in display order.
 * @throws If a link is not an item link, points to a missing item or to an
 *   item that is not a work, or repeats.
 */
export async function parseFeatured(
  baseDir: string,
  items: Item[],
): Promise<string[]> {
  const source = await readFile(join(baseDir, "works.md"), "utf-8")
  const itemsById = new Map(items.map((item) => [item.id, item]))

  const featured: string[] = []
  for (const token of md.parse(source, {})) {
    for (const child of token.children ?? []) {
      if (child.type !== "link_open") continue

      const href = child.attrGet("href") ?? ""
      const id = ITEM_LINK_RE.exec(href)?.[1]
      if (!id) {
        throw new Error(`works.md: '${href}' is not a link to an item`)
      }
      const item = itemsById.get(id)
      if (!item) {
        throw new Error(`works.md: items/${id} does not exist`)
      }
      if (!isWork(item)) {
        throw new Error(`works.md: items/${id} is not a work`)
      }
      if (featured.includes(id)) {
        throw new Error(`works.md: items/${id} is listed twice`)
      }
      featured.push(id)
    }
  }

  return featured
}

/**
 * Marks an unlisted work with `additionalProperty` `listed: false`.
 */
export function withUnlisted(item: Item): Item {
  return {
    ...item,
    jsonld: {
      ...item.jsonld,
      additionalProperty: [
        ...(item.jsonld.additionalProperty ?? []),
        { "@type": "PropertyValue", name: "listed", value: false },
      ],
    },
  }
}
