import type { InferSelectModel } from "drizzle-orm"
import type {
  writeupAuthors,
  writeupBugs,
  writeupNotes,
  writeupPrograms,
  writeupReads,
  writeups,
} from "~/server/db/schema"
import { type RouterOutputs } from "~/trpc/shared"

export type Writeup = InferSelectModel<typeof writeups>
export type WriteupBug = InferSelectModel<typeof writeupBugs>
export type WriteupProgram = InferSelectModel<typeof writeupPrograms>
export type WriteupAuthor = InferSelectModel<typeof writeupAuthors>
export type WriteupNote = InferSelectModel<typeof writeupNotes>
export type WriteupRead = InferSelectModel<typeof writeupReads>

export type WriteupWithRelations =
  RouterOutputs["writeups"]["getWriteups"]["items"][number]
