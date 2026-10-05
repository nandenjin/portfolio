export interface JsonLdPropertyValue {
  "@type": "PropertyValue"
  name: string
  value: string | boolean
}

export interface JsonLdBase {
  "@context": "https://schema.org"
  "@type": string
  additionalProperty?: JsonLdPropertyValue[]
  [key: string]: unknown
}

/**
 * A page (`items/<id>/index.md`). What kind of page it is (work, event,
 * news, ...) is told by the JSON-LD `@type`, not by the storage location.
 */
export interface Item {
  id: string
  jsonld: JsonLdBase
  body_html: string
}

/**
 * All content baked into the Worker at build time (`src/content.gen.ts`).
 *
 * `items` is pre-sorted newest first (`startDate`, else `datePublished`).
 * `featuredOrder` holds the ids of the same items with the featured works
 * (`works.md`) first, in their curated order, and the rest newest first.
 */
export interface ContentBundle {
  items: Item[]
  featuredOrder: string[]
}
