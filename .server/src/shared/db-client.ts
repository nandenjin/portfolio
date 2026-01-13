import Database from "better-sqlite3"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    const dbPath =
      process.env.DB_PATH || join(__dirname, "../../dist/portfolio.db")
    db = new Database(dbPath, { readonly: true })
  }
  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
