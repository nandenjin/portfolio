import { getDb } from "../../shared/db-client"
import type { JsonLdBase, Profile } from "../../types/content"

function parseJsonLd(value: string | null): JsonLdBase {
  if (!value) {
    throw new Error("Profile JSON-LD is missing")
  }

  return JSON.parse(value) as JsonLdBase
}

export function getProfile(): Profile | null {
  const db = getDb()
  const row = db.prepare("SELECT * FROM profile WHERE id = 'profile'").get() as
    | any
    | undefined

  if (!row) return null

  return {
    id: "profile",
    jsonld: parseJsonLd(row.jsonld),
    body_html: row.body_html,
    created_at: row.created_at,
  }
}
