import Database from "better-sqlite3"
import { WORKS_SCHEMA_SQL } from "../src/models/works/index"
import { EVENTS_SCHEMA_SQL } from "../src/models/events/index"
import { NEWS_SCHEMA_SQL } from "../src/models/news/index"
import { PROFILE_SCHEMA_SQL } from "../src/models/profile/index"
import type { Work, Event, News, Profile } from "../src/types/content"

export function populateDatabase(
  dbPath: string,
  works: Work[],
  events: Event[],
  news: News[],
  profile: Profile,
): void {
  const db = new Database(dbPath)

  try {
    // Create schema
    db.exec(WORKS_SCHEMA_SQL)
    db.exec(EVENTS_SCHEMA_SQL)
    db.exec(NEWS_SCHEMA_SQL)
    db.exec(PROFILE_SCHEMA_SQL)

    // Prepare insert statements
    const insertWork = db.prepare(`
      INSERT INTO works (id, jsonld, body_html)
      VALUES (?, ?, ?)
    `)

    const insertEvent = db.prepare(`
      INSERT INTO events (id, jsonld, body_html)
      VALUES (?, ?, ?)
    `)

    const insertNews = db.prepare(`
      INSERT INTO news (id, jsonld, body_html)
      VALUES (?, ?, ?)
    `)

    const insertProfile = db.prepare(`
      INSERT INTO profile (id, jsonld, body_html)
      VALUES (?, ?, ?)
    `)

    // Insert works
    const insertManyWorks = db.transaction((items: Work[]) => {
      for (const item of items) {
        insertWork.run(item.id, JSON.stringify(item.jsonld), item.body_html)
      }
    })

    // Insert events
    const insertManyEvents = db.transaction((items: Event[]) => {
      for (const item of items) {
        insertEvent.run(item.id, JSON.stringify(item.jsonld), item.body_html)
      }
    })

    // Insert news
    const insertManyNews = db.transaction((items: News[]) => {
      for (const item of items) {
        insertNews.run(item.id, JSON.stringify(item.jsonld), item.body_html)
      }
    })

    const insertOneProfile = db.transaction((item: Profile) => {
      insertProfile.run(item.id, JSON.stringify(item.jsonld), item.body_html)
    })

    insertManyWorks(works)
    insertManyEvents(events)
    insertManyNews(news)
    insertOneProfile(profile)

    console.log(
      `Database populated: ${works.length} works, ${events.length} events, ${news.length} news, profile`,
    )
  } finally {
    db.close()
  }
}
