import { readdir, readFile } from "fs/promises"
import matter from "gray-matter"
import { join } from "path"
import MarkdownIt from "markdown-it"
import type { Event } from "../../../src/types/content"

const md = new MarkdownIt()

export async function parseEvents(baseDir: string): Promise<Event[]> {
  const eventsDir = join(baseDir, "events")
  const dirs = await readdir(eventsDir, { withFileTypes: true })

  const events: Event[] = []

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue

    const id = dir.name
    const mdPath = join(eventsDir, id, "index.md")

    try {
      const content = await readFile(mdPath, "utf-8")
      const { data: frontmatter, content: body } = matter(content)
      const fm = frontmatter as any

      // Convert markdown to HTML
      const bodyHtml = md.render(body)

      // Convert dates to ISO string if they're Date objects
      const sessionStart =
        fm.session_start instanceof Date
          ? fm.session_start.toISOString().split("T")[0]
          : (fm.session_start ?? "")
      const sessionEnd =
        fm.session_end instanceof Date
          ? fm.session_end.toISOString().split("T")[0]
          : (fm.session_end ?? "")

      events.push({
        id,
        is_exhibition: fm.is_exhibition === true,
        title_ja: fm.title_ja ?? "",
        title_en: fm.title_en ?? "",
        session_start: sessionStart,
        session_end: sessionEnd,
        locations: fm.locations ?? [],
        related_works: fm.related_works ?? [],
        thumbnail: fm.thumbnail ?? null,
        external_infos: fm.external_infos ?? null,
        body_html: bodyHtml,
      })
    } catch (error) {
      console.error(`Error parsing event ${id}:`, error)
    }
  }

  return events
}
