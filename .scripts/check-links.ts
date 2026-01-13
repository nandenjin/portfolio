import { toAst, NodeFixed } from "https://deno.land/x/charmd@v0.0.2/mod.ts"
import {
  test as testFm,
  extract as parseFm,
} from "https://deno.land/std@0.145.0/encoding/front_matter.ts"
import { consola } from "https://esm.sh/consola@3.2.3"
import { walkSync, existsSync } from "https://deno.land/std@0.221.0/fs/mod.ts"
import { relative, resolve } from "https://deno.land/std@0.221.0/path/mod.ts"
import { join } from "https://deno.land/std@0.221.0/path/join.ts"

/** Absolute path for project root */
const root = resolve(Deno.args[0] || Deno.cwd())

consola.info(`Checking links in ${root}`)

let hasError = false

// Crawl all markdown files
for (const entry of walkSync(root, { match: [/\.md$/i] })) {
  if (entry.path.includes("/node_modules/")) continue
  consola.trace(entry.path)
  hasError = (await hasInvalidLink(entry.path)) || hasError
}

if (hasError) {
  Deno.exit(1)
} else {
  consola.success("All links are OK")
}

/**
 * Check links in a markdown file
 * @param filename
 * @returns true if there are invalid links
 */
async function hasInvalidLink(filename: string): Promise<boolean> {
  // Make it absolute path
  filename = resolve(filename)

  consola.debug(`Checking links in ${filename}`)
  const markdown = await Deno.readTextFile(filename)

  // Parse markdown
  const node = toAst(markdown) as NodeFixed

  /** Links collected */
  const links =
    // Collect links in markdown
    findLinks(node)

  // Collect links in Frontmatter
  if (testFm(markdown)) {
    try {
      const fm = parseFm<FrontMatter>(markdown)

      // Add thumbnail link
      if (fm.attrs.thumbnail) {
        links.push({ url: fm.attrs.thumbnail, hint: "thumbnail" })
      }

      // Add related_works links
      if (fm.attrs.relaeted_works) {
        links.push(
          ...fm.attrs.relaeted_works.map((id) => ({
            url: `/works/${id}`, // Convert from work id to internal path
            hint: "related_works",
          })),
        )
      }
    } catch (e) {
      consola.warn(`Failed to parse frontmatter in ${filename}: ${e}`)
    }
  }

  let hasError = false
  for (const link of links) {
    // Skip external links
    if (!isInternalURL(link.url)) continue

    // Create absolute path
    const path = join(
      root,

      // Make it absolute path, in repo root
      resolve("/" + relative(root, filename), "..", link.url),
    )

    // Check if the file exists
    if (existsSync(path)) {
      consola.trace(`OK: ${link.url}`)
    } else {
      consola.error(
        `Invalid link: ${link.url}\n\tat ${filename}${
          link.line && link.column
            ? `:${link.line}:${link.column}`
            : link.hint
              ? ` (${link.hint})`
              : ""
        }`,
      )
      hasError = true
    }
  }

  return hasError
}

type FrontMatter = {
  title: string
  thumbnail?: string
  relaeted_works?: string[]
}

type Link = {
  url: string
  hint?: string
  line?: number
  column?: number
}

/**
 * Check if the URL is internal (not to internet)
 */
function isInternalURL(url: string): boolean {
  return url.startsWith("/") || url.startsWith("./")
}

/**
 * Find links in a markdown AST
 * @param node
 * @returns
 */
function findLinks(node: NodeFixed): Link[] {
  const links: Link[] = []
  if ((node.type === "image" || node.type === "link") && node.url) {
    links.push({
      url: node.url,
      line: node.position.start.line,
      column: node.position.start.column,
    })
  }

  if (node.children) {
    for (const child of node.children) {
      links.push(...findLinks(child as NodeFixed))
    }
  }

  return links
}
