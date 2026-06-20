import { readdir, readFile } from "fs/promises"
import { join } from "path"
import MarkdownIt from "markdown-it"
import type { Event } from "../../../src/types/content"
import {
  extractJsonLdScript,
  withBodyHtmlAdditionalProperty,
} from "../../jsonld"

const md = new MarkdownIt()

export async function parseEvents(baseDir: string): Promise<Event[]> {
  const eventsDir = join(baseDir, "events")
  const dirs = await readdir(eventsDir, { withFileTypes: true })

  const events: Event[] = []

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue

    const id = dir.name
    const mdPath = join(eventsDir, id, "index.md")

    const content = await readFile(mdPath, "utf-8")
    const { jsonld: extractedJsonLd, contentWithoutJsonLd } =
      extractJsonLdScript(content)

    if (!extractedJsonLd) {
      throw new Error(`Missing JSON-LD script in events/${id}/index.md`)
    }

    // Convert markdown to HTML
    const bodyHtml = md.render(contentWithoutJsonLd)

    events.push({
      id,
      jsonld: withBodyHtmlAdditionalProperty(extractedJsonLd, bodyHtml),
      body_html: bodyHtml,
    })
  }

  return events
}
