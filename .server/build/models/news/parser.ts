import { readdir, readFile } from "fs/promises"
import { join } from "path"
import MarkdownIt from "markdown-it"
import type { News } from "../../../src/types/content"
import {
  extractJsonLdScript,
  withBodyHtmlAdditionalProperty,
} from "../../jsonld"

const md = new MarkdownIt()

export async function parseNews(baseDir: string): Promise<News[]> {
  const newsDir = join(baseDir, "news")
  const dirs = await readdir(newsDir, { withFileTypes: true })

  const news: News[] = []

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue

    const id = dir.name
    const mdPath = join(newsDir, id, "index.md")

    const content = await readFile(mdPath, "utf-8")
    const { jsonld: extractedJsonLd, contentWithoutJsonLd } =
      extractJsonLdScript(content)

    if (!extractedJsonLd) {
      throw new Error(`Missing JSON-LD script in news/${id}/index.md`)
    }

    // Convert markdown to HTML
    const bodyHtml = md.render(contentWithoutJsonLd)

    news.push({
      id,
      jsonld: withBodyHtmlAdditionalProperty(extractedJsonLd, bodyHtml),
      body_html: bodyHtml,
    })
  }

  return news
}
