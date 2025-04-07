import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm"
import type { NodePgDatabase } from "drizzle-orm/node-postgres"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import {
  writeupAuthors,
  writeupAuthorsWriteups,
  writeupBugs,
  writeupBugsWriteups,
  writeupNotes,
  writeupPrograms,
  writeupProgramsWriteups,
  writeupReads,
  writeups,
} from "~/server/db/schema"

type DbClient = NodePgDatabase<typeof import("~/server/db/schema")>

const writeupSchema = z.object({
  Links: z
    .array(
      z.object({
        Title: z.string(),
        Link: z.string(),
      })
    )
    .default([]),
  Authors: z.array(z.string().min(1)).default([]),
  Programs: z.array(z.string().min(1)).default([]),
  Bugs: z.array(z.string().min(1)).default([]),
  Bounty: z.string().default("-"),
  PublicationDate: z.string().default("-"),
  AddedDate: z.string().default("-"),
})

type WriteupInput = z.infer<typeof writeupSchema>

async function processWriteups(db: DbClient, writeupInputs: WriteupInput[]) {
  // Skip the date filtering and only check for unique links
  const existingLinks = await db.select({ link: writeups.link }).from(writeups)
  const existingLinkSet = new Set(existingLinks.map((row) => row.link))

  // Get all existing authors, programs, and bugs first
  const [allAuthors, allPrograms, allBugs] = await Promise.all([
    db.select().from(writeupAuthors),
    db.select().from(writeupPrograms),
    db.select().from(writeupBugs),
  ])

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

  if (filteredWriteups.length === 0) {
    return []
  }

  return await db.transaction(async (tx) => {
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

    const results = await Promise.all(
      filteredWriteups.map(async (data) => {
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

        return writeup
      })
    )

    return results.filter((r): r is NonNullable<typeof r> => r !== null)
  })
}

export const writeupsRouter = createTRPCRouter({
  getWriteups: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        authors: z.array(z.string()).optional(),
        programs: z.array(z.string()).optional(),
        bugs: z.array(z.string()).optional(),
        onlyWithNotes: z.boolean().optional(),
        onlyRead: z.boolean().optional(),
        sortBy: z.enum(["publishedAt", "addedAt"]).default("addedAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        page: z.number().default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        search,
        authors,
        programs,
        bugs,
        onlyWithNotes,
        onlyRead,
        sortBy,
        sortOrder,
        page,
      } = input
      const limit = 100
      const offset = (page - 1) * limit

      const conditions = []
      if (search) {
        conditions.push(
          or(
            ilike(writeups.title, `%${search}%`),
            ilike(writeups.link, `%${search}%`)
          )
        )
      }

      // Get writeup IDs that match the filters first
      let filteredWriteupIds: number[] = []

      const [
        authorWriteups,
        programWriteups,
        bugWriteups,
        writeupWithNotes,
        readWriteups,
      ] = await Promise.all([
        authors?.length
          ? ctx.db
              .select({ writeupId: writeupAuthorsWriteups.writeupId })
              .from(writeupAuthorsWriteups)
              .innerJoin(
                writeupAuthors,
                eq(writeupAuthorsWriteups.authorId, writeupAuthors.id)
              )
              .where(inArray(writeupAuthors.author, authors))
          : Promise.resolve([]),
        programs?.length
          ? ctx.db
              .select({ writeupId: writeupProgramsWriteups.writeupId })
              .from(writeupProgramsWriteups)
              .innerJoin(
                writeupPrograms,
                eq(writeupProgramsWriteups.programId, writeupPrograms.id)
              )
              .where(inArray(writeupPrograms.program, programs))
          : Promise.resolve([]),
        bugs?.length
          ? ctx.db
              .select({ writeupId: writeupBugsWriteups.writeupId })
              .from(writeupBugsWriteups)
              .innerJoin(
                writeupBugs,
                eq(writeupBugsWriteups.bugId, writeupBugs.id)
              )
              .where(inArray(writeupBugs.bug, bugs))
          : Promise.resolve([]),
        onlyWithNotes
          ? ctx.db
              .select({ writeupId: writeupNotes.writeupId })
              .from(writeupNotes)
              .where(eq(writeupNotes.userId, ctx.session.user.id))
          : Promise.resolve([]),
        onlyRead
          ? ctx.db
              .select({ writeupId: writeupReads.writeupId })
              .from(writeupReads)
              .where(eq(writeupReads.userId, ctx.session.user.id))
          : Promise.resolve([]),
      ])

      const authorIds = new Set(authorWriteups.map((w) => w.writeupId))
      const programIds = new Set(programWriteups.map((w) => w.writeupId))
      const bugIds = new Set(bugWriteups.map((w) => w.writeupId))
      const noteIds = new Set(writeupWithNotes.map((w) => w.writeupId))
      const readIds = new Set(readWriteups.map((w) => w.writeupId))

      const allIds = new Set([...authorIds, ...programIds, ...bugIds])

      if (allIds.size > 0 || onlyWithNotes || onlyRead) {
        filteredWriteupIds = Array.from(
          allIds.size > 0 ? allIds : new Set([...noteIds, ...readIds])
        ).filter((id): id is number => {
          if (id === null) return false
          const matchesAuthors = !authors?.length || authorIds.has(id)
          const matchesPrograms = !programs?.length || programIds.has(id)
          const matchesBugs = !bugs?.length || bugIds.has(id)
          const matchesNotes = !onlyWithNotes || noteIds.has(id)
          const matchesRead = !onlyRead || readIds.has(id)
          return (
            matchesAuthors &&
            matchesPrograms &&
            matchesBugs &&
            matchesNotes &&
            matchesRead
          )
        })

        if (filteredWriteupIds.length === 0) {
          return {
            items: [],
            total: 0,
            pageCount: 0,
          }
        }

        conditions.push(inArray(writeups.id, filteredWriteupIds))
      }

      const baseQuery = ctx.db
        .select({
          id: writeups.id,
          title: writeups.title,
          link: writeups.link,
          publishedAt: writeups.publishedAt,
          addedAt: writeups.addedAt,
          bounty: writeups.bounty,
          createdAt: writeups.createdAt,
          updatedAt: writeups.updatedAt,
        })
        .from(writeups)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(
          sortOrder === "desc" ? desc(writeups[sortBy]) : writeups[sortBy]
        )
        .limit(limit)
        .offset(offset)

      const writeupsList = await baseQuery

      const writeupIds = writeupsList.map((w) => w.id)

      const [authorsData, programsData, bugsData, notesData, readsData] =
        await Promise.all([
          ctx.db
            .select({
              writeupId: writeupAuthorsWriteups.writeupId,
              author: writeupAuthors.author,
            })
            .from(writeupAuthorsWriteups)
            .innerJoin(
              writeupAuthors,
              eq(writeupAuthorsWriteups.authorId, writeupAuthors.id)
            )
            .where(inArray(writeupAuthorsWriteups.writeupId, writeupIds)),
          ctx.db
            .select({
              writeupId: writeupProgramsWriteups.writeupId,
              program: writeupPrograms.program,
            })
            .from(writeupProgramsWriteups)
            .innerJoin(
              writeupPrograms,
              eq(writeupProgramsWriteups.programId, writeupPrograms.id)
            )
            .where(inArray(writeupProgramsWriteups.writeupId, writeupIds)),
          ctx.db
            .select({
              writeupId: writeupBugsWriteups.writeupId,
              bug: writeupBugs.bug,
            })
            .from(writeupBugsWriteups)
            .innerJoin(
              writeupBugs,
              eq(writeupBugsWriteups.bugId, writeupBugs.id)
            )
            .where(inArray(writeupBugsWriteups.writeupId, writeupIds)),
          ctx.db
            .select({
              writeupId: writeupNotes.writeupId,
              note: writeupNotes.note,
            })
            .from(writeupNotes)
            .where(
              and(
                inArray(writeupNotes.writeupId, writeupIds),
                eq(writeupNotes.userId, ctx.session.user.id)
              )
            ),
          ctx.db
            .select({
              writeupId: writeupReads.writeupId,
            })
            .from(writeupReads)
            .where(
              and(
                inArray(writeupReads.writeupId, writeupIds),
                eq(writeupReads.userId, ctx.session.user.id)
              )
            ),
        ])

      const writeupsWithRelations = writeupsList.map((writeup) => ({
        ...writeup,
        authors: authorsData
          .filter((a) => a.writeupId === writeup.id)
          .map((a) => a.author),
        programs: programsData
          .filter((p) => p.writeupId === writeup.id)
          .map((p) => p.program),
        bugs: bugsData
          .filter((b) => b.writeupId === writeup.id)
          .map((b) => b.bug),
        note: notesData.find((n) => n.writeupId === writeup.id)?.note ?? null,
        isRead: readsData.some((r) => r.writeupId === writeup.id),
      }))

      const totalQuery = await ctx.db
        .select({ count: sql<number>`count(distinct ${writeups.id})` })
        .from(writeups)
        .where(conditions.length > 0 ? and(...conditions) : undefined)

      const total = totalQuery[0]?.count ?? 0

      return {
        items: writeupsWithRelations,
        total,
        pageCount: Math.ceil(total / limit),
      }
    }),

  createFromJson: protectedProcedure
    .input(z.array(writeupSchema))
    .mutation(async ({ ctx, input }) => {
      return processWriteups(ctx.db, input)
    }),

  fetchAndCreateFromJson: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const response = await fetch("https://pentester.land/writeups.json")
      if (!response.ok) {
        throw new Error(`Failed to fetch writeups: ${response.statusText}`)
      }
      const data = await response.json()

      // Ensure we have an array of writeups
      const writeupData = data.data && Array.isArray(data.data) ? data.data : []

      // Validate the data against our schema
      const validatedWriteups = writeupData
        .map((item: any) => {
          try {
            return writeupSchema.parse(item)
          } catch (error) {
            return null
          }
        })
        .filter(Boolean) as WriteupInput[]

      if (validatedWriteups.length === 0) {
        throw new Error("No valid writeups found in the API response")
      }

      const results = await processWriteups(ctx.db, validatedWriteups)

      return { count: results.length, success: true }
    } catch (error) {
      throw new Error(
        `Failed to fetch and create writeups: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }),

  toggleRead: protectedProcedure
    .input(
      z.object({
        writeupId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { writeupId } = input

      const existingRead = await ctx.db
        .select({
          id: writeupReads.id,
        })
        .from(writeupReads)
        .where(
          and(
            eq(writeupReads.writeupId, writeupId),
            eq(writeupReads.userId, ctx.session.user.id)
          )
        )
        .limit(1)
        .then((rows) => rows[0])

      if (existingRead) {
        await ctx.db
          .delete(writeupReads)
          .where(eq(writeupReads.id, existingRead.id))
      } else {
        await ctx.db.insert(writeupReads).values({
          writeupId,
          userId: ctx.session.user.id,
        })
      }
    }),

  createNote: protectedProcedure
    .input(z.object({ writeupId: z.number(), note: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingNote = await ctx.db
        .select({
          id: writeupNotes.id,
        })
        .from(writeupNotes)
        .where(
          and(
            eq(writeupNotes.writeupId, input.writeupId),
            eq(writeupNotes.userId, ctx.session.user.id)
          )
        )
        .limit(1)
        .then((rows) => rows[0])

      if (existingNote) {
        await ctx.db
          .update(writeupNotes)
          .set({ note: input.note })
          .where(eq(writeupNotes.id, existingNote.id))
      } else {
        await ctx.db.insert(writeupNotes).values({
          writeupId: input.writeupId,
          userId: ctx.session.user.id,
          note: input.note,
        })
      }
    }),

  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    return await ctx.db.transaction(async (tx) => {
      await tx.delete(writeupAuthorsWriteups)
      await tx.delete(writeupProgramsWriteups)
      await tx.delete(writeupBugsWriteups)
      await tx.delete(writeupAuthors)
      await tx.delete(writeupPrograms)
      await tx.delete(writeupBugs)
      await tx.delete(writeupNotes)
      await tx.delete(writeupReads)
      await tx.delete(writeups)
      return { success: true }
    })
  }),

  getUniqueAuthors: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, page } = input
      const limit = 100
      const offset = (page - 1) * limit

      const conditions = [sql`${writeupAuthors.author} IS NOT NULL`]
      if (search) {
        conditions.push(ilike(writeupAuthors.author, `%${search}%`))
      }

      const query = ctx.db
        .selectDistinct({ author: writeupAuthors.author })
        .from(writeupAuthors)
        .where(and(...conditions))
        .orderBy(writeupAuthors.author)
        .limit(limit)
        .offset(offset)

      const countQuery = ctx.db
        .select({
          count: sql<number>`count(distinct ${writeupAuthors.author})`,
        })
        .from(writeupAuthors)
        .where(and(...conditions))

      const [authors, countResult] = await Promise.all([query, countQuery])
      const total = countResult[0]?.count ?? 0

      return {
        items: authors.map((a) => a.author!),
        total,
        pageCount: Math.ceil(total / limit),
      }
    }),

  getUniquePrograms: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, page } = input
      const limit = 100
      const offset = (page - 1) * limit

      const conditions = [sql`${writeupPrograms.program} IS NOT NULL`]
      if (search) {
        conditions.push(ilike(writeupPrograms.program, `%${search}%`))
      }

      const query = ctx.db
        .selectDistinct({ program: writeupPrograms.program })
        .from(writeupPrograms)
        .where(and(...conditions))
        .orderBy(writeupPrograms.program)
        .limit(limit)
        .offset(offset)

      const countQuery = ctx.db
        .select({
          count: sql<number>`count(distinct ${writeupPrograms.program})`,
        })
        .from(writeupPrograms)
        .where(and(...conditions))

      const [programs, countResult] = await Promise.all([query, countQuery])
      const total = countResult[0]?.count ?? 0

      return {
        items: programs.map((p) => p.program!),
        total,
        pageCount: Math.ceil(total / limit),
      }
    }),

  getUniqueBugs: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, page } = input
      const limit = 100
      const offset = (page - 1) * limit

      const conditions = [sql`${writeupBugs.bug} IS NOT NULL`]
      if (search) {
        conditions.push(ilike(writeupBugs.bug, `%${search}%`))
      }

      const query = ctx.db.query.writeupBugs.findMany({
        where: and(...conditions),
        orderBy: [writeupBugs.bug],
        limit,
        offset,
      })

      const countQuery = ctx.db
        .select({ count: sql<number>`count(distinct ${writeupBugs.bug})` })
        .from(writeupBugs)
        .where(and(...conditions))

      const [bugs, countResult] = await Promise.all([query, countQuery])
      const total = countResult[0]?.count ?? 0

      return {
        items: bugs.map((b) => b.bug!),
        total,
        pageCount: Math.ceil(total / limit),
      }
    }),

  getWriteupsWithNotes: protectedProcedure.mutation(async ({ ctx }) => {
    const writeupsList = await ctx.db
      .select({
        id: writeups.id,
        title: writeups.title,
        link: writeups.link,
        publishedAt: writeups.publishedAt,
        addedAt: writeups.addedAt,
        bounty: writeups.bounty,
      })
      .from(writeups)
      .innerJoin(writeupNotes, eq(writeups.id, writeupNotes.writeupId))
      .where(eq(writeupNotes.userId, ctx.session.user.id))

    const writeupIds = writeupsList.map((w) => w.id)

    const [authorsData, programsData, bugsData, notesData] = await Promise.all([
      ctx.db
        .select({
          writeupId: writeupAuthorsWriteups.writeupId,
          author: writeupAuthors.author,
        })
        .from(writeupAuthorsWriteups)
        .innerJoin(
          writeupAuthors,
          eq(writeupAuthorsWriteups.authorId, writeupAuthors.id)
        )
        .where(inArray(writeupAuthorsWriteups.writeupId, writeupIds)),
      ctx.db
        .select({
          writeupId: writeupProgramsWriteups.writeupId,
          program: writeupPrograms.program,
        })
        .from(writeupProgramsWriteups)
        .innerJoin(
          writeupPrograms,
          eq(writeupProgramsWriteups.programId, writeupPrograms.id)
        )
        .where(inArray(writeupProgramsWriteups.writeupId, writeupIds)),
      ctx.db
        .select({
          writeupId: writeupBugsWriteups.writeupId,
          bug: writeupBugs.bug,
        })
        .from(writeupBugsWriteups)
        .innerJoin(writeupBugs, eq(writeupBugsWriteups.bugId, writeupBugs.id))
        .where(inArray(writeupBugsWriteups.writeupId, writeupIds)),
      ctx.db
        .select()
        .from(writeupNotes)
        .where(
          and(
            inArray(writeupNotes.writeupId, writeupIds),
            eq(writeupNotes.userId, ctx.session.user.id)
          )
        ),
    ])

    return writeupsList.map((writeup) => ({
      ...writeup,
      authors: authorsData
        .filter((a) => a.writeupId === writeup.id)
        .map((a) => a.author),
      programs: programsData
        .filter((p) => p.writeupId === writeup.id)
        .map((p) => p.program),
      bugs: bugsData
        .filter((b) => b.writeupId === writeup.id)
        .map((b) => b.bug),
      notes: notesData
        .filter((n) => n.writeupId === writeup.id)
        .map((n) => n.note),
    }))
  }),

  totalReads: protectedProcedure.query(async ({ ctx }) => {
    const total = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(writeupReads)
      .where(eq(writeupReads.userId, ctx.session.user.id))
    return total[0]?.count ?? 0
  }),

  totalNotes: protectedProcedure.query(async ({ ctx }) => {
    const total = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(writeupNotes)
      .where(eq(writeupNotes.userId, ctx.session.user.id))
    return total[0]?.count ?? 0
  }),
})
