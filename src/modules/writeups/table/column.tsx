import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column"
import { Badge } from "~/components/ui/badge"
import { type WriteupWithRelations } from "~/lib/types"
import { WriteupActions } from "./actions"

export const columns = (
  onAuthorAdd: (value: string) => void,
  onProgramAdd: (value: string) => void,
  onBugAdd: (value: string) => void
): ColumnDef<WriteupWithRelations>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => {
      return (
        <Link
          target='_blank'
          className='text-amber-200 block w-[500px] text-wrap'
          href={row.original.link as string}
        >
          {row.original.title}
        </Link>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    size: 100,
    cell: ({ row }) => <WriteupActions writeup={row.original} />,
  },
  {
    accessorKey: "authors",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Authors' />
    ),
    cell: ({ row }) => {
      const authors = row.original.authors
      return (
        <div className='flex flex-wrap gap-1'>
          {authors
            .filter((a): a is string => a !== null)
            .map((author) => (
              <Badge
                onClick={() => onAuthorAdd(author)}
                key={author}
                variant='secondary'
              >
                {author}
              </Badge>
            ))}
        </div>
      )
    },
    size: 150,
  },
  {
    accessorKey: "programs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Programs' />
    ),
    cell: ({ row }) => {
      const programs = row.original.programs
      return (
        <div className='flex flex-wrap gap-1'>
          {programs
            .filter((p): p is string => p !== null)
            .map((program) => (
              <Badge
                onClick={() => onProgramAdd(program)}
                key={program}
                variant='outline'
              >
                {program}
              </Badge>
            ))}
        </div>
      )
    },
    size: 150,
  },
  {
    accessorKey: "bugs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bugs' />
    ),
    cell: ({ row }) => {
      const bugs = row.original.bugs
      return (
        <div className='flex flex-wrap gap-1'>
          {bugs
            .filter((b): b is string => b !== null)
            .map((bug) => (
              <Badge
                onClick={() => onBugAdd(bug)}
                key={bug}
                variant='destructive'
              >
                {bug}
              </Badge>
            ))}
        </div>
      )
    },
    size: 150,
  },
  {
    accessorKey: "bounty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bounty' />
    ),
    size: 100,
  },
  {
    accessorKey: "publishedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Published' />
    ),
    cell: ({ row }) => {
      const date = row.getValue("publishedAt") as Date | null
      return date ? date.toLocaleDateString() : null
    },
    size: 120,
  },
  {
    accessorKey: "addedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Added' />
    ),
    cell: ({ row }) => {
      const date = row.getValue("addedAt") as Date | null
      return date ? date.toLocaleDateString() : null
    },
    size: 120,
  },
]
