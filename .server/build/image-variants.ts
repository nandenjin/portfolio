import { join } from "node:path"
import { imageSizeFromFile } from "image-size/fromFile"
import type { JsonLdBase } from "../src/types/content"

/**
 * Widths (px) of the `srcset` candidates.
 *
 * Derived from the kzmi.jp frontend layout: article images are at most 700 CSS
 * px wide and cards at most ~656 CSS px, so 1600 covers DPR 2 for both.
 * Cloudflare bills every distinct transformation option string once per month
 * (see `toTransformUrl` in `src/shared/jsonld.ts`), so keep this ladder short
 * and change it deliberately.
 */
export const IMAGE_WIDTHS = [400, 640, 960, 1280, 1600] as const

/** Formats that must be served untouched (vector / possibly animated). */
const PASSTHROUGH_EXT = /\.(svg|gif)$/i

export interface ImageVariants {
  /** Intrinsic size of the source image. */
  width: number
  height: number
  /** Bare `/static/...` path shared by every candidate. */
  path: string
  /** Candidate widths, ascending. Never larger than the intrinsic width. */
  widths: number[]
}

const cache = new Map<string, Promise<ImageVariants | null>>()

/**
 * Reads the intrinsic size of a static asset and works out its `srcset` widths.
 *
 * @param projectRoot - Repository root holding `works/`, `events/`, ...
 * @param staticPath - Public path, e.g. `/static/works/foo/a.png` (percent-encoding allowed).
 * @returns `null` when the image should be served as-is: svg/gif, missing file,
 *   or unreadable header. Never throws, so one broken image cannot fail the build.
 */
export function imageVariants(
  projectRoot: string,
  staticPath: string,
): Promise<ImageVariants | null> {
  let hit = cache.get(staticPath)
  if (!hit) {
    hit = readVariants(projectRoot, staticPath)
    cache.set(staticPath, hit)
  }
  return hit
}

async function readVariants(
  projectRoot: string,
  staticPath: string,
): Promise<ImageVariants | null> {
  if (!staticPath.startsWith("/static/") || PASSTHROUGH_EXT.test(staticPath)) {
    return null
  }
  try {
    const file = join(
      projectRoot,
      decodeURI(staticPath.slice("/static".length)),
    )
    const { width, height } = await imageSizeFromFile(file)
    if (!width || !height) return null
    return {
      width,
      height,
      path: staticPath,
      widths: IMAGE_WIDTHS.filter((w) => w <= width),
    }
  } catch {
    return null
  }
}

/** `srcset` value with bare paths and `w` descriptors, or `undefined` if not needed. */
export function srcsetOf(v: ImageVariants): string | undefined {
  if (v.widths.length === 0) return undefined
  const path = encodeURI(decodeURI(v.path))
  return v.widths.map((w) => `${path} ${w}w`).join(", ")
}

/**
 * Adds `srcset` / `width` / `height` / `loading` / `decoding` to every `<img>`
 * pointing at `/static/...`. Existing attributes are never overwritten.
 */
export async function addImageVariantsToHtml(
  html: string,
  projectRoot: string,
): Promise<string> {
  const re = /<img\b([^>]*?)\ssrc="(\/static\/[^"]+)"([^>]*?)(\s*\/?)>/g
  const matches = [...html.matchAll(re)]
  const replacements = await Promise.all(
    matches.map(async (m) => {
      const [whole, pre, src, post, end] = m
      const attrs = `${pre}${post}`
      const v = await imageVariants(projectRoot, src)
      if (!v) return whole
      const srcset = srcsetOf(v)
      const extra = [
        srcset && !/\ssrcset=/.test(attrs) ? ` srcset="${srcset}"` : "",
        !/\swidth=/.test(attrs) ? ` width="${v.width}"` : "",
        !/\sheight=/.test(attrs) ? ` height="${v.height}"` : "",
        !/\sloading=/.test(attrs) ? ' loading="lazy"' : "",
        !/\sdecoding=/.test(attrs) ? ' decoding="async"' : "",
      ].join("")
      return `<img${pre} src="${src}"${post}${extra}${end}>`
    }),
  )
  let i = 0
  return html.replace(re, () => replacements[i++])
}

/**
 * Expands `image: ["/works/x/a.png", ...]` in a JSON-LD object into
 * `ImageObject`s carrying the intrinsic size and a `srcset` property.
 * `contentUrl` is already the `/static/...` path; the request-time layer
 * (`src/shared/jsonld.ts`) absolutizes it and turns `srcset` into
 * transformation URLs.
 */
export async function expandJsonLdImages(
  jsonld: JsonLdBase,
  projectRoot: string,
): Promise<JsonLdBase> {
  const image = jsonld.image
  if (!Array.isArray(image)) return jsonld

  const expanded = await Promise.all(
    image.map(async (item) => {
      if (typeof item !== "string") return item
      const contentUrl =
        item.startsWith("/static/") || !item.startsWith("/")
          ? item
          : `/static${item}`
      const v = await imageVariants(projectRoot, contentUrl)
      const srcset = v && srcsetOf(v)
      return {
        "@type": "ImageObject",
        contentUrl,
        ...(v && { width: v.width, height: v.height }),
        ...(srcset && {
          additionalProperty: [
            { "@type": "PropertyValue", name: "srcset", value: srcset },
          ],
        }),
      }
    }),
  )
  return { ...jsonld, image: expanded }
}
