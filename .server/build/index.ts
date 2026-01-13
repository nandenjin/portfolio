import { join, dirname } from "path"
import { fileURLToPath } from "url"
import fs from "fs-extra"
import { parseWorks } from "./models/works/parser"
import { parseEvents } from "./models/events/parser"
import { parseNews } from "./models/news/parser"
import { populateDatabase } from "./db-populate"
import { copyAssets } from "./copy-assets"
import {
  normalizeThumbnailPath,
  normalizeImagePathsInHtml,
} from "./normalize-paths"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function build() {
  const rootDir = join(__dirname, "..")
  const projectRoot = join(rootDir, "..")
  const distDir = join(rootDir, "dist")

  console.log("Starting build...")
  console.log("Project root:", projectRoot)
  console.log("Dist dir:", distDir)

  // 1. Clean dist
  console.log("\n1. Cleaning dist directory...")
  await fs.remove(distDir)
  await fs.ensureDir(distDir)

  // 2. Parse content
  console.log("\n2. Parsing markdown files...")
  let works = await parseWorks(projectRoot)
  let events = await parseEvents(projectRoot)
  let news = await parseNews(projectRoot)

  console.log(
    `Parsed ${works.length} works, ${events.length} events, ${news.length} news`,
  )

  // 3. Normalize paths
  console.log("\n3. Normalizing paths...")
  works = works.map((work) => ({
    ...work,
    thumbnail: normalizeThumbnailPath(work.thumbnail, "works", work.id),
    body_html: normalizeImagePathsInHtml(work.body_html, "works", work.id),
  }))

  events = events.map((event) => ({
    ...event,
    thumbnail: normalizeThumbnailPath(event.thumbnail, "events", event.id),
    body_html: normalizeImagePathsInHtml(event.body_html, "events", event.id),
  }))

  news = news.map((item) => ({
    ...item,
    body_html: normalizeImagePathsInHtml(item.body_html, "news", item.id),
  }))

  // 4. Populate database
  console.log("\n4. Creating database...")
  const dbPath = join(distDir, "portfolio.db")
  populateDatabase(dbPath, works, events, news)

  // 5. Copy assets
  console.log("\n5. Copying assets...")
  await copyAssets(projectRoot, distDir)

  console.log("\n✓ Build complete!")
  console.log(`  Database: ${dbPath}`)
  console.log(`  Static assets: ${join(distDir, "static")}`)
}

build().catch((error) => {
  console.error("Build failed:", error)
  process.exit(1)
})
