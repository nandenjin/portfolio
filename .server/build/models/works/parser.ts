import { readdir, readFile } from "fs/promises"
import matter from "gray-matter"
import { join } from "path"
import MarkdownIt from "markdown-it"
import type { Work } from "../../../src/types/content"

const md = new MarkdownIt()

export async function parseWorks(baseDir: string): Promise<Work[]> {
  const worksDir = join(baseDir, "works")
  const dirs = await readdir(worksDir, { withFileTypes: true })

  const works: Work[] = []

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue

    const id = dir.name
    const mdPath = join(worksDir, id, "index.md")

    try {
      const content = await readFile(mdPath, "utf-8")
      const { data: frontmatter, content: body } = matter(content)
      const fm = frontmatter as any

      // Convert markdown to HTML
      const bodyHtml = md.render(body)

      // Convert release date to ISO string if it's a Date object
      const release =
        fm.release instanceof Date
          ? fm.release.toISOString().split("T")[0]
          : (fm.release ?? "")

      works.push({
        id,
        title_en: fm.title_en ?? "",
        title_ja: fm.title_ja ?? "",
        creator: fm.creator ?? "",
        materials: fm.materials ?? "",
        year: fm.year ?? 0,
        tags: fm.tags ? fm.tags.split(/\s+/).filter(Boolean) : [],
        thumbnail: fm.thumbnail ?? null,
        release,
        info: fm.info ?? null,
        body_html: bodyHtml,
      })
    } catch (error) {
      console.error(`Error parsing work ${id}:`, error)
    }
  }

  return works
}
