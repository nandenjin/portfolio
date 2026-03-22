import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { mkdir } from "node:fs/promises"
import { parseWorks } from "./models/works/parser"
import { parseEvents } from "./models/events/parser"
import { parseNews } from "./models/news/parser"
import { parseProfile } from "./models/profile/parser"
import { populateDatabase } from "./db-populate"
import { copyAssets } from "./copy-assets"
import { normalizeImagePathsInHtml } from "./normalize-paths"
import { withBodyHtmlAdditionalProperty } from "./jsonld"

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
  await mkdir(distDir, { recursive: true })

  // 2. Parse content
  console.log("\n2. Parsing markdown files...")
  let works = await parseWorks(projectRoot)
  let events = await parseEvents(projectRoot)
  let news = await parseNews(projectRoot)
  let profile = await parseProfile(projectRoot)

  console.log(
    `Parsed ${works.length} works, ${events.length} events, ${news.length} news, profile`,
  )

  // 3. Normalize paths
  console.log("\n3. Normalizing paths...")
  works = works.map((work) => {
    const bodyHtml = normalizeImagePathsInHtml(work.body_html, "works", work.id)
    return {
      ...work,
      body_html: bodyHtml,
      jsonld: withBodyHtmlAdditionalProperty(work.jsonld, bodyHtml),
    }
  })

  events = events.map((event) => {
    const bodyHtml = normalizeImagePathsInHtml(
      event.body_html,
      "events",
      event.id,
    )
    return {
      ...event,
      body_html: bodyHtml,
      jsonld: withBodyHtmlAdditionalProperty(event.jsonld, bodyHtml),
    }
  })

  news = news.map((item) => {
    const bodyHtml = normalizeImagePathsInHtml(item.body_html, "news", item.id)
    return {
      ...item,
      body_html: bodyHtml,
      jsonld: withBodyHtmlAdditionalProperty(item.jsonld, bodyHtml),
    }
  })

  {
    const bodyHtml = normalizeImagePathsInHtml(
      profile.body_html,
      "profile",
      profile.id,
    )
    profile = {
      ...profile,
      body_html: bodyHtml,
      jsonld: withBodyHtmlAdditionalProperty(profile.jsonld, bodyHtml),
    }
  }

  // 4. Populate database
  console.log("\n4. Creating database...")
  const dbPath = join(distDir, "portfolio.db")
  populateDatabase(dbPath, works, events, news, profile)

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
