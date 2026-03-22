import { readFile } from "fs/promises"
import { join } from "path"
import MarkdownIt from "markdown-it"
import type { Profile } from "../../../src/types/content"
import {
  extractJsonLdScript,
  withBodyHtmlAdditionalProperty,
} from "../../jsonld"

const md = new MarkdownIt()

export async function parseProfile(baseDir: string): Promise<Profile> {
  const mdPath = join(baseDir, "profile", "index.md")

  const content = await readFile(mdPath, "utf-8")
  const { jsonld: extractedJsonLd, contentWithoutJsonLd } =
    extractJsonLdScript(content)

  if (!extractedJsonLd) {
    throw new Error("Missing JSON-LD script in profile/index.md")
  }

  const bodyHtml = md.render(contentWithoutJsonLd)

  return {
    id: "profile",
    jsonld: withBodyHtmlAdditionalProperty(extractedJsonLd, bodyHtml),
    body_html: bodyHtml,
  }
}
