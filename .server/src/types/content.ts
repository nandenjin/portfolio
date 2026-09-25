export interface JsonLdPropertyValue {
  "@type": "PropertyValue"
  name: string
  value: string
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
 */
export interface ContentBundle {
  items: Item[]
}
