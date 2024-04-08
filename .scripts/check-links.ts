import { toAst, Node } from "https://deno.land/x/charmd@v0.0.1/mod.ts"
import {
  test as testFm,
  extract as parseFm,
} from "https://deno.land/std@0.145.0/encoding/front_matter.ts"
import { consola } from "https://esm.sh/consola@3.2.3"
import { walkSync, existsSync } from "https://deno.land/std@0.221.0/fs/mod.ts"
import { resolve, join } from "https://deno.land/std@0.221.0/path/mod.ts"

const root = resolve(Deno.args[0] || Deno.cwd())

consola.info(`Checking links in ${root}`)

let hasError = false
for (const entry of walkSync(root, { match: [/\.md$/i] })) {
  consola.trace(entry.path)
  hasError = (await checkFile(entry.path)) || hasError
}

if (hasError) {
  Deno.exit(1)
} else {
  consola.success("All links are OK")
}

async function checkFile(filename: string): Promise<boolean> {
  filename = resolve(filename)
  const markdown = await Deno.readTextFile(filename)
  const node = toAst(markdown)
  const links = []

  links.push(...findLinks(node))

  if (testFm(markdown)) {
    const fm = parseFm<FrontMatter>(markdown)
    if (fm.attrs.thumbnail) {
      links.push({ url: fm.attrs.thumbnail, hint: "thumbnail" })
    }

    if (fm.attrs.relaeted_works) {
      links.push(
        ...fm.attrs.relaeted_works.map((id) => ({
          url: `/works/${id}`,
          hint: "related_works",
        }))
      )
    }
  }

  let hasError = false
  for (const link of links) {
    if (isRelativeUrl(link.url)) {
      const path = join(Deno.cwd(), resolve(filename, "..", link.url))
      if (existsSync(path)) {
        consola.trace(`OK: ${link.url}`)
      } else {
        if (!hasError) {
          consola.error(`In ${filename}:`)
        }
        consola.error(`  Not found: ${link.url}`)
        hasError = true
      }
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
}

function isRelativeUrl(url: string): boolean {
  return url.startsWith("/") || url.startsWith("./")
}

function findLinks(node: Node): Link[] {
  const links: Link[] = []
  switch (node.type) {
    case "link":
      if (node.url) {
        links.push({ url: node.url })
      }
      break
    case "image":
      if (node.url) {
        links.push({ url: node.url })
      }
      break
  }

  if (node.children) {
    for (const child of node.children) {
      links.push(...findLinks(child))
    }
  }

  return links
}
