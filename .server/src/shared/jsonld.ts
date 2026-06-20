import type { JsonLdBase } from "../types/content"

type Lang = "ja" | "en"
const URL_LIKE_KEYS = new Set([
  "url",
  "mainEntityOfPage",
  "sameAs",
  "image",
  "contentUrl",
  "thumbnailUrl",
])

export function toApiJsonLd(
  jsonld: JsonLdBase,
  options?: { lang?: string; origin?: string; includeBodyHtml?: boolean },
): JsonLdBase {
  const lang = options?.lang
  const origin = options?.origin
  const includeBodyHtml = options?.includeBodyHtml ?? true

  const localized =
    lang === "ja" || lang === "en"
      ? (resolveLanguage(jsonld, lang) as JsonLdBase)
      : jsonld

  const rewritten = rewritePathsToUrls(localized, origin) as JsonLdBase
  return includeBodyHtml
    ? rewritten
    : stripBodyHtmlFromAdditionalProperty(rewritten)
}

function resolveLanguage(value: unknown, lang: Lang): unknown {
  if (Array.isArray(value)) {
    if (isLanguageValueArray(value)) {
      return pickLanguageValue(value, lang)
    }

    return value.map((item) => resolveLanguage(item, lang))
  }

  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(
      value as Record<string, unknown>,
    )) {
      out[key] = resolveLanguage(child, lang)
    }
    return out
  }

  return value
}

function isLanguageValueArray(
  value: unknown[],
): value is Array<{ "@value": string; "@language": string }> {
  if (value.length === 0) return false

  return value.every((item) => {
    if (!item || typeof item !== "object") return false
    const rec = item as Record<string, unknown>
    return (
      typeof rec["@value"] === "string" && typeof rec["@language"] === "string"
    )
  })
}

function pickLanguageValue(
  values: Array<{ "@value": string; "@language": string }>,
  lang: Lang,
): string {
  const exact = values.find((entry) => entry["@language"] === lang)
  if (exact) return exact["@value"]

  const alt = values.find(
    (entry) => entry["@language"] === (lang === "ja" ? "en" : "ja"),
  )
  if (alt) return alt["@value"]

  return values[0]?.["@value"] ?? ""
}

function rewritePathsToUrls(
  value: unknown,
  origin?: string,
  key?: string,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => rewritePathsToUrls(item, origin, key))
  }

  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [childKey, child] of Object.entries(
      value as Record<string, unknown>,
    )) {
      out[childKey] = rewritePathsToUrls(child, origin, childKey)
    }

    // additionalProperty: [{name: body_html, value: "..."}] のHTMLもURL化
    if (
      out.name === "body_html" &&
      typeof out.value === "string" &&
      typeof origin === "string"
    ) {
      out.value = absolutizeHtmlPaths(out.value, origin)
    }

    return out
  }

  if (typeof value === "string") {
    if (!origin) return value

    if (URL_LIKE_KEYS.has(key ?? "")) {
      return absolutizePath(value, origin, key)
    }

    if (key === "value" && looksLikeAssetPath(value)) {
      return absolutizePath(value, origin, "image")
    }
  }

  return value
}

function absolutizePath(value: string, origin: string, key?: string): string {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value
  }

  if (value.startsWith("/")) {
    const normalized = normalizeInternalAssetPath(value, key)
    return `${origin}${normalized}`
  }

  return value
}

function absolutizeHtmlPaths(html: string, origin: string): string {
  return html.replace(/(src|href)="\/(?!\/)([^"]+)"/g, (_m, attr, path) => {
    const originalPath = `/${path}`
    const normalizedPath =
      attr === "src"
        ? normalizeInternalAssetPath(originalPath, "image")
        : normalizeInternalAssetPath(originalPath)

    return `${attr}="${origin}${normalizedPath}"`
  })
}

function normalizeInternalAssetPath(value: string, key?: string): string {
  if (value.startsWith("/static/")) {
    return value
  }

  const internalContentPath = /^\/(works|events|news|profile)\//.test(value)
  if (!internalContentPath) {
    return value
  }

  const keySuggestsAsset =
    key === "image" || key === "thumbnailUrl" || key === "contentUrl"

  if (keySuggestsAsset || looksLikeAssetPath(value)) {
    return `/static${value}`
  }

  return value
}

function looksLikeAssetPath(value: string): boolean {
  return /\.[a-zA-Z0-9]{2,5}($|[?#])/.test(value)
}

function stripBodyHtmlFromAdditionalProperty(jsonld: JsonLdBase): JsonLdBase {
  const cloned = structuredClone(jsonld) as JsonLdBase
  const additionalProperty = cloned.additionalProperty

  if (!Array.isArray(additionalProperty)) {
    return cloned
  }

  const filtered = additionalProperty.filter(
    (item) => item.name !== "body_html",
  )

  if (filtered.length === 0) {
    delete cloned.additionalProperty
    return cloned
  }

  cloned.additionalProperty = filtered
  return cloned
}
