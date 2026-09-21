import type { JsonLdBase } from "../src/types/content"

const JSON_LD_SCRIPT_RE =
  /<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi

export interface ExtractJsonLdResult {
  jsonld: JsonLdBase | null
  contentWithoutJsonLd: string
}

export function extractJsonLdScript(markdown: string): ExtractJsonLdResult {
  const matches = [...markdown.matchAll(JSON_LD_SCRIPT_RE)]

  const contentWithoutJsonLd = markdown.replace(JSON_LD_SCRIPT_RE, "").trim()

  if (matches.length === 0) {
    return { jsonld: null, contentWithoutJsonLd }
  }

  if (matches.length > 1) {
    throw new Error("Only one JSON-LD script tag is allowed per markdown file")
  }

  const jsonText = matches[0]?.[1]?.trim() ?? ""
  if (!jsonText) {
    throw new Error("JSON-LD script tag is empty")
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch (error) {
    throw new Error(
      `Failed to parse JSON-LD script: ${(error as Error).message}`,
    )
  }

  if (!isJsonLdBase(parsed)) {
    throw new Error("JSON-LD must include @context and @type")
  }

  return {
    jsonld: parsed,
    contentWithoutJsonLd,
  }
}

export function withBodyHtmlAdditionalProperty(
  jsonld: JsonLdBase,
  bodyHtml: string,
): JsonLdBase {
  const additionalProperty = Array.isArray(jsonld.additionalProperty)
    ? [...jsonld.additionalProperty]
    : []

  const withoutBodyHtml = additionalProperty.filter(
    (item) => item.name !== "body_html",
  )

  withoutBodyHtml.push({
    "@type": "PropertyValue",
    name: "body_html",
    value: bodyHtml,
  })

  return {
    ...jsonld,
    additionalProperty: withoutBodyHtml,
  }
}

function isJsonLdBase(value: unknown): value is JsonLdBase {
  if (!value || typeof value !== "object") return false

  const maybe = value as Record<string, unknown>
  return (
    maybe["@context"] === "https://schema.org" &&
    typeof maybe["@type"] === "string" &&
    maybe["@type"].length > 0
  )
}
