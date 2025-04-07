import { relations } from "drizzle-orm"
import {
  integer,
  numeric,
  pgTableCreator,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

export const createTable = pgTableCreator((name) => `writeup-app_${name}`)

export const writeups = createTable("writeup", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  title: text("title"),
  link: text("link"),
  publishedAt: timestamp("published_at"),
  addedAt: timestamp("added_at"),
  bounty: numeric("bounty"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const writeupNotes = createTable("writeup_note", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  note: text("note"),
  writeupId: integer("writeup_id").references(() => writeups.id, {
    onDelete: "cascade",
  }),
  userId: text("user_id").references(() => user.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const writeupReads = createTable("writeup_read", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  writeupId: integer("writeup_id").references(() => writeups.id, {
    onDelete: "cascade",
  }),
  userId: text("user_id").references(() => user.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const usersRelations = relations(user, ({ many }) => ({
  writeupNotes: many(writeupNotes),
  writeupReads: many(writeupReads),
}))

export const writeupNotesRelations = relations(writeupNotes, ({ one }) => ({
  user: one(user, {
    fields: [writeupNotes.userId],
    references: [user.id],
  }),
}))

export const writeupReadsRelations = relations(writeupReads, ({ one }) => ({
  user: one(user, {
    fields: [writeupReads.userId],
    references: [user.id],
  }),
}))

export const writeupBugs = createTable("writeup_bug", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  bug: text("bug"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const writeupPrograms = createTable("writeup_program", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),

  program: text("program"),
})

export const writeupAuthors = createTable("writeup_author", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  author: text("author"),
})

export const writeupAuthorsWriteups = createTable("writeup_authors_writeups", {
  authorId: integer("author_id").references(() => writeupAuthors.id, {
    onDelete: "cascade",
  }),
  writeupId: integer("writeup_id").references(() => writeups.id, {
    onDelete: "cascade",
  }),
})

export const writeupBugsWriteups = createTable("writeup_bugs_writeups", {
  bugId: integer("bug_id").references(() => writeupBugs.id, {
    onDelete: "cascade",
  }),
  writeupId: integer("writeup_id").references(() => writeups.id, {
    onDelete: "cascade",
  }),
})

export const writeupProgramsWriteups = createTable(
  "writeup_programs_writeups",
  {
    programId: integer("program_id").references(() => writeupPrograms.id, {
      onDelete: "cascade",
    }),
    writeupId: integer("writeup_id").references(() => writeups.id, {
      onDelete: "cascade",
    }),
  }
)

export const writeupsRelations = relations(writeups, ({ many }) => ({
  authors: many(writeupAuthorsWriteups),
  bugs: many(writeupBugsWriteups),
  programs: many(writeupProgramsWriteups),
  notes: many(writeupNotes),
  reads: many(writeupReads),
}))

export const writeupAuthorsRelations = relations(
  writeupAuthors,
  ({ many }) => ({
    writeups: many(writeupAuthorsWriteups),
  })
)

export const writeupBugsRelations = relations(writeupBugs, ({ many }) => ({
  writeups: many(writeupBugsWriteups),
}))

export const writeupProgramsRelations = relations(
  writeupPrograms,
  ({ many }) => ({
    writeups: many(writeupProgramsWriteups),
  })
)

export * from "./auth-schema"
