import Database from "better-sqlite3"
import { WORKS_SCHEMA_SQL } from "../src/models/works/index"
import { EVENTS_SCHEMA_SQL } from "../src/models/events/index"
import { NEWS_SCHEMA_SQL } from "../src/models/news/index"
import type { Work, Event, News } from "../src/types/content"

export function populateDatabase(
  dbPath: string,
  works: Work[],
  events: Event[],
  news: News[],
): void {
  const db = new Database(dbPath)

  try {
    // Create schema
    db.exec(WORKS_SCHEMA_SQL)
    db.exec(EVENTS_SCHEMA_SQL)
    db.exec(NEWS_SCHEMA_SQL)

    // Prepare insert statements
    const insertWork = db.prepare(`
      INSERT INTO works (id, title_en, title_ja, creator, materials, year, tags, thumbnail, release, info, body_html)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const insertEvent = db.prepare(`
      INSERT INTO events (id, is_exhibition, title_ja, title_en, session_start, session_end, locations, related_works, thumbnail, external_infos, body_html)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const insertNews = db.prepare(`
      INSERT INTO news (id, title_en, title_ja, tags, release, body_html)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    // Insert works
    const insertManyWorks = db.transaction((items: Work[]) => {
      for (const item of items) {
        insertWork.run(
          item.id,
          item.title_en,
          item.title_ja,
          item.creator,
          item.materials,
          item.year,
          JSON.stringify(item.tags),
          item.thumbnail ?? null,
          item.release,
          item.info ?? null,
          item.body_html,
        )
      }
    })

    // Insert events
    const insertManyEvents = db.transaction((items: Event[]) => {
      for (const item of items) {
        insertEvent.run(
          item.id,
          item.is_exhibition ? 1 : 0,
          item.title_ja,
          item.title_en,
          item.session_start,
          item.session_end,
          JSON.stringify(item.locations),
          JSON.stringify(item.related_works),
          item.thumbnail ?? null,
          item.external_infos ? JSON.stringify(item.external_infos) : null,
          item.body_html,
        )
      }
    })

    // Insert news
    const insertManyNews = db.transaction((items: News[]) => {
      for (const item of items) {
        insertNews.run(
          item.id,
          item.title_en,
          item.title_ja,
          JSON.stringify(item.tags),
          item.release,
          item.body_html,
        )
      }
    })

    insertManyWorks(works)
    insertManyEvents(events)
    insertManyNews(news)

    console.log(
      `Database populated: ${works.length} works, ${events.length} events, ${news.length} news`,
    )
  } finally {
    db.close()
  }
}
