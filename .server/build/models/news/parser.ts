import { readdir, readFile } from "fs/promises"
import matter from "gray-matter"
import { join } from "path"
import MarkdownIt from "markdown-it"
import type { News } from "../../../src/types/content"

const md = new MarkdownIt()

export async function parseNews(baseDir: string): Promise<News[]> {
  const newsDir = join(baseDir, "news")
  const dirs = await readdir(newsDir, { withFileTypes: true })

  const news: News[] = []

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue

    const id = dir.name
    const mdPath = join(newsDir, id, "index.md")

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

      news.push({
        id,
        title_en: fm.title_en ?? "",
        title_ja: fm.title_ja ?? "",
        tags: fm.tags ? fm.tags.split(/\s+/).filter(Boolean) : [],
        release,
        body_html: bodyHtml,
      })
    } catch (error) {
      console.error(`Error parsing news ${id}:`, error)
    }
  }

  return news
}
