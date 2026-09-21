import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { mkdir } from "node:fs/promises"
import { parseWorks } from "./models/works/parser"
import { parseEvents } from "./models/events/parser"
import { parseNews } from "./models/news/parser"
import { parseProfile } from "./models/profile/parser"
import { emitContent } from "./content-emit"
import { copyAssets } from "./copy-assets"
import { normalizeImagePathsInHtml } from "./normalize-paths"
import { withBodyHtmlAdditionalProperty } from "./jsonld"
import { addImageVariantsToHtml, expandJsonLdImages } from "./image-variants"
import type { JsonLdBase } from "../src/types/content"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function prepareItem<
  T extends { id: string; jsonld: JsonLdBase; body_html: string },
>(
  item: T,
  contentType: "works" | "events" | "news" | "profile",
  projectRoot: string,
): Promise<T> {
  const bodyHtml = await addImageVariantsToHtml(
    normalizeImagePathsInHtml(item.body_html, contentType, item.id),
    projectRoot,
  )
  const jsonld = await expandJsonLdImages(item.jsonld, projectRoot)
  return {
    ...item,
    body_html: bodyHtml,
    jsonld: withBodyHtmlAdditionalProperty(jsonld, bodyHtml),
  }
}

async function build() {
  const rootDir = join(__dirname, "..")
  const projectRoot = join(rootDir, "..")
  const distDir = join(rootDir, "dist")
  const publicDir = join(distDir, "public")

  console.log("Starting build...")
  console.log("Project root:", projectRoot)
  console.log("Dist dir:", distDir)

  // 1. Prepare output dir (only dist/public is uploaded as static assets)
  await mkdir(publicDir, { recursive: true })

  // 2. Parse content
  console.log("\n2. Parsing markdown files...")
  let works = await parseWorks(projectRoot)
  let events = await parseEvents(projectRoot)
  let news = await parseNews(projectRoot)
  let profile = await parseProfile(projectRoot)

  console.log(
    `Parsed ${works.length} works, ${events.length} events, ${news.length} news, profile`,
  )

  // 3. Normalize paths and attach image variants (srcset / intrinsic size)
  console.log("\n3. Normalizing paths and image variants...")
  works = await Promise.all(
    works.map((w) => prepareItem(w, "works", projectRoot)),
  )
  events = await Promise.all(
    events.map((e) => prepareItem(e, "events", projectRoot)),
  )
  news = await Promise.all(news.map((n) => prepareItem(n, "news", projectRoot)))
  profile = await prepareItem(profile, "profile", projectRoot)

  // 4. Emit content module
  console.log("\n4. Emitting content module...")
  const contentPath = join(rootDir, "src", "content.gen.ts")
  await emitContent(contentPath, works, events, news, profile)

  // 5. Copy assets
  console.log("\n5. Copying assets...")
  await copyAssets(projectRoot, publicDir)

  console.log("\n✓ Build complete!")
  console.log(`  Content: ${contentPath}`)
  console.log(`  Static assets: ${join(publicDir, "static")}`)
}

build().catch((error) => {
  console.error("Build failed:", error)
  process.exit(1)
})
