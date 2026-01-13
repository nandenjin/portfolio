import { cp } from "fs/promises"
import { join } from "path"

export async function copyAssets(
  srcDir: string,
  destDir: string,
): Promise<void> {
  const contentTypes = ["works", "events", "news"]

  for (const type of contentTypes) {
    const srcPath = join(srcDir, type)
    const destPath = join(destDir, "static", type)

    try {
      await cp(srcPath, destPath, {
        filter: (src: string) => {
          // Exclude markdown files
          if (src.endsWith(".md")) return false
          // Exclude index.md file specifically
          if (src.endsWith("index.md")) return false
          return true
        },
        recursive: true,
      })
      console.log(`Copied ${type} assets to ${destPath}`)
    } catch (error) {
      console.error(`Error copying ${type} assets:`, error)
    }
  }
}
