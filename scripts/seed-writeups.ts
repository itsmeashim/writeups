import { drizzle } from "drizzle-orm/node-postgres"
import { createRequire } from "module"
import { env } from "~/env"
import * as schema from "~/server/db/schema"
const require = createRequire(import.meta.url)
const { Pool } = require("pg")

const WRITEUP_URL = "https://pentester.land/writeups.json"

import type { NodePgDatabase } from "drizzle-orm/node-postgres"
import {
  writeupAuthors,
  writeupAuthorsWriteups,
  writeupBugs,
  writeupBugsWriteups,
  writeupPrograms,
  writeupProgramsWriteups,
  writeups,
} from "~/server/db/schema"
type DbClient = NodePgDatabase<typeof import("~/server/db/schema")>

interface WriteupInput {
  Links: Array<{ Title: string; Link: string }>
  Authors: string[]
  Programs: string[]
  Bugs: string[]
  Bounty: string
  PublicationDate: string
  AddedDate: string
}

async function main() {
  try {
    const pool = new Pool({
      connectionString: env.DATABASE_URL,
    })

    const db = drizzle(pool, { schema })

    console.log("🌱 Fetching writeups from", WRITEUP_URL)

    const response = await fetch(WRITEUP_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch writeups: ${response.statusText}`)
    }

    const data = await response.json()
    const writeupData = data.data && Array.isArray(data.data) ? data.data : []

    if (writeupData.length === 0) {
      throw new Error("No writeups found in the API response")
    }

    console.log(`📝 Found ${writeupData.length} writeups`)

    const results = await processWriteups(db, writeupData)

    console.log(`✅ Successfully created ${results.length} writeups`)

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding writeups:", error)
    process.exit(1)
  }
}

main()

export async function processWriteups(
  db: DbClient,
  writeupInputs: WriteupInput[]
) {
  console.log(`Processing ${writeupInputs.length} writeups...`)

  // Skip the date filtering and only check for unique links
  const existingLinks = await db.select({ link: writeups.link }).from(writeups)
  const existingLinkSet = new Set(existingLinks.map((row) => row.link))
  console.log(`Found ${existingLinks.length} existing writeups in database`)

  // Get all existing authors, programs, and bugs first
  const [allAuthors, allPrograms, allBugs] = await Promise.all([
    db.select().from(writeupAuthors),
    db.select().from(writeupPrograms),
    db.select().from(writeupBugs),
  ])
  console.log(
    `Loaded ${allAuthors.length} authors, ${allPrograms.length} programs, and ${allBugs.length} bugs`
  )

  const existingAuthorsSet = new Set(allAuthors.map((a) => a.author))
  const existingProgramsSet = new Set(allPrograms.map((p) => p.program))
  const existingBugsSet = new Set(allBugs.map((b) => b.bug))

  // Collect all unique new values
  const newAuthorsSet = new Set<string>()
  const newProgramsSet = new Set<string>()
  const newBugsSet = new Set<string>()

  const filteredWriteups = writeupInputs.filter((data) => {
    if (data.Links[0]?.Link && existingLinkSet.has(data.Links[0].Link)) {
      return false
    }

    // Collect unique values while filtering
    data.Authors.forEach((a) => {
      if (a !== "-" && a.trim() && !existingAuthorsSet.has(a)) {
        newAuthorsSet.add(a)
      }
    })
    data.Programs.forEach((p) => {
      if (p !== "-" && p.trim() && !existingProgramsSet.has(p)) {
        newProgramsSet.add(p)
      }
    })
    data.Bugs.forEach((b) => {
      if (b !== "-" && b.trim() && !existingBugsSet.has(b)) {
        newBugsSet.add(b)
      }
    })

    return true
  })

  console.log(`Found ${filteredWriteups.length} new writeups to add`)
  console.log(
    `Discovered ${newAuthorsSet.size} new authors, ${newProgramsSet.size} new programs, and ${newBugsSet.size} new bugs`
  )

  if (filteredWriteups.length === 0) {
    console.log("No new writeups to add, skipping transaction")
    return []
  }

  return await db.transaction(async (tx) => {
    console.log("Starting database transaction...")

    // Insert all new unique values first
    const [insertedAuthors, insertedPrograms, insertedBugs] = await Promise.all(
      [
        newAuthorsSet.size > 0
          ? tx
              .insert(writeupAuthors)
              .values(Array.from(newAuthorsSet).map((author) => ({ author })))
              .returning()
          : Promise.resolve([]),
        newProgramsSet.size > 0
          ? tx
              .insert(writeupPrograms)
              .values(
                Array.from(newProgramsSet).map((program) => ({ program }))
              )
              .returning()
          : Promise.resolve([]),
        newBugsSet.size > 0
          ? tx
              .insert(writeupBugs)
              .values(Array.from(newBugsSet).map((bug) => ({ bug })))
              .returning()
          : Promise.resolve([]),
      ]
    )
    console.log(
      `Inserted ${insertedAuthors.length} authors, ${insertedPrograms.length} programs, and ${insertedBugs.length} bugs`
    )

    // Create lookup maps for faster access
    const authorMap = new Map([
      ...allAuthors.map((a) => [a.author, a] as const),
      ...insertedAuthors.map((a) => [a.author, a] as const),
    ])
    const programMap = new Map([
      ...allPrograms.map((p) => [p.program, p] as const),
      ...insertedPrograms.map((p) => [p.program, p] as const),
    ])
    const bugMap = new Map([
      ...allBugs.map((b) => [b.bug, b] as const),
      ...insertedBugs.map((b) => [b.bug, b] as const),
    ])

    console.log(`Processing ${filteredWriteups.length} writeups in batches...`)
    let processedCount = 0

    const results = await Promise.all(
      filteredWriteups.map(async (data, index) => {
        if (!data.Links[0]?.Link || !data.Links[0]?.Title) {
          return null
        }

        const bountyStr = data.Bounty.replace(/[^0-9.-]+/g, "")
        const bountyNum = bountyStr === "" ? null : Number(bountyStr)
        const bountyValue =
          data.Bounty === "-" || !bountyNum || !isFinite(bountyNum)
            ? null
            : bountyStr

        const writeupResult = await tx
          .insert(writeups)
          .values({
            title: data.Links[0].Title,
            link: data.Links[0].Link,
            publishedAt:
              data.PublicationDate === "-"
                ? null
                : new Date(data.PublicationDate),
            addedAt: data.AddedDate === "-" ? null : new Date(data.AddedDate),
            bounty: bountyValue,
          })
          .returning()

        const writeup = writeupResult[0]
        if (!writeup) {
          return null
        }

        const writeupId = writeup.id

        // Get unique IDs using the maps
        const authorIds = [
          ...new Set(
            data.Authors.filter((a) => a !== "-" && a.trim())
              .map((a) => authorMap.get(a)?.id)
              .filter((id): id is number => id !== undefined)
          ),
        ]

        const programIds = [
          ...new Set(
            data.Programs.filter((p) => p !== "-" && p.trim())
              .map((p) => programMap.get(p)?.id)
              .filter((id): id is number => id !== undefined)
          ),
        ]

        const bugIds = [
          ...new Set(
            data.Bugs.filter((b) => b !== "-" && b.trim())
              .map((b) => bugMap.get(b)?.id)
              .filter((id): id is number => id !== undefined)
          ),
        ]

        await Promise.all([
          authorIds.length
            ? tx.insert(writeupAuthorsWriteups).values(
                authorIds.map((authorId) => ({
                  authorId,
                  writeupId,
                }))
              )
            : Promise.resolve(),
          programIds.length
            ? tx.insert(writeupProgramsWriteups).values(
                programIds.map((programId) => ({
                  programId,
                  writeupId,
                }))
              )
            : Promise.resolve(),
          bugIds.length
            ? tx.insert(writeupBugsWriteups).values(
                bugIds.map((bugId) => ({
                  bugId,
                  writeupId,
                }))
              )
            : Promise.resolve(),
        ])

        processedCount++
        if (
          processedCount % 10 === 0 ||
          processedCount === filteredWriteups.length
        ) {
          console.log(
            `Progress: ${processedCount}/${
              filteredWriteups.length
            } writeups processed (${Math.round(
              (processedCount / filteredWriteups.length) * 100
            )}%)`
          )
        }

        return writeup
      })
    )

    const validResults = results.filter(
      (r): r is NonNullable<typeof r> => r !== null
    )
    console.log(
      `Transaction complete. Successfully added ${validResults.length} writeups`
    )

    return validResults
  })
}
