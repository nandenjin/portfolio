import { readdir, readFile } from "fs/promises"
import { join } from "path"
import MarkdownIt from "markdown-it"
import type { Work } from "../../../src/types/content"
import {
  extractJsonLdScript,
  withBodyHtmlAdditionalProperty,
} from "../../jsonld"

const md = new MarkdownIt()

export async function parseWorks(baseDir: string): Promise<Work[]> {
  const worksDir = join(baseDir, "works")
  const dirs = await readdir(worksDir, { withFileTypes: true })

  const works: Work[] = []

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue

    const id = dir.name
    const mdPath = join(worksDir, id, "index.md")

    const content = await readFile(mdPath, "utf-8")
    const { jsonld: extractedJsonLd, contentWithoutJsonLd } =
      extractJsonLdScript(content)

    if (!extractedJsonLd) {
      throw new Error(`Missing JSON-LD script in works/${id}/index.md`)
    }

    // Convert markdown to HTML
    const bodyHtml = md.render(contentWithoutJsonLd)

    works.push({
      id,
      jsonld: withBodyHtmlAdditionalProperty(extractedJsonLd, bodyHtml),
      body_html: bodyHtml,
    })
  }

  return works
}
