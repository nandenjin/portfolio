import { cp, readdir, writeFile } from "fs/promises"
import { join } from "path"

/**
 * Copies non-Markdown assets (images etc.) of every content type into
 * `<destDir>/static/<type>/`, preserving the directory structure.
 *
 * `destDir` is uploaded as-is by Workers Static Assets, so it must contain
 * nothing but public files.
 *
 * @param srcDir - Repository root holding `works/`, `events/`, `news/` and `profile/`.
 * @param destDir - Static assets root (`dist/public`).
 * @throws If a copy fails, or if no file at all was copied.
 */
export async function copyAssets(
  srcDir: string,
  destDir: string,
): Promise<void> {
  const contentTypes = ["works", "events", "news", "profile"]
  // Number of files (not directories) written across all content types
  let copied = 0

  for (const type of contentTypes) {
    const srcPath = join(srcDir, type)
    const destPath = join(destDir, "static", type)

    try {
      await cp(srcPath, destPath, {
        filter: (src: string) => {
          // Exclude markdown files
          if (src.endsWith(".md")) return false
          // Exclude index.md file specifically
          if (src.endsWith("index.md")) return false
          return true
        },
        recursive: true,
      })
      // `cp` also creates directories, so count only files in the result
      const files = await readdir(destPath, {
        recursive: true,
        withFileTypes: true,
      })
      copied += files.filter((f) => f.isFile()).length
      console.log(`Copied ${type} assets to ${destPath}`)
    } catch (error) {
      console.error(
        `Error copying ${type} assets from ${srcPath} to ${destPath}:`,
        error,
      )
      throw new Error(
        `Failed to copy assets for content type "${type}". See previous log for details.`,
      )
    }
  }

  // A source tree with only Markdown copies zero files without erroring (e.g.
  // when images were dropped from the build context); fail loudly instead of
  // deploying a site with no images.
  if (copied === 0) {
    throw new Error(`No assets were copied from ${srcDir}`)
  }

  await writeFile(join(destDir, "_headers"), STATIC_HEADERS)
}

/**
 * Cache policy for `/static/*` (Workers Static Assets `_headers`).
 *
 * Cloudflare Image Transformations cache their output following the source
 * image's Cache-Control (1 hour minimum), so a long TTL here raises the edge
 * hit rate of every resized variant. File names carry no content hash, hence
 * no `immutable`: after replacing an image under the same name, purge the cache.
 */
const STATIC_HEADERS = `/static/*
  Cache-Control: public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400
`
