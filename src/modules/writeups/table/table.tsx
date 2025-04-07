"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableViewOptions } from "~/components/data-table/data-table-column-toggle"
import { DataTableProvider } from "~/components/data-table/data-table-context"
import { Button } from "~/components/ui/button"
import { useWriteupsSearch } from "~/hooks/use-writeups-search"
import { type WriteupWithRelations } from "~/lib/types"
import { api } from "~/trpc/react"
import { DownloadNotesButton } from "../components/download-notes-button"
import { SearchInput } from "../components/search-input"
import { columns } from "./column"

export function WriteupsTable() {
  const [searchParams, setSearchParams] = useWriteupsSearch()
  const [page, setPage] = useState(1)

  // Search states for dropdowns
  const [authorSearch, setAuthorSearch] = useState("")
  const [programSearch, setProgramSearch] = useState("")
  const [bugSearch, setBugSearch] = useState("")
  const [authorOpen, setAuthorOpen] = useState(false)
  const [programOpen, setProgramOpen] = useState(false)
  const [bugOpen, setBugOpen] = useState(false)

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [
    searchParams.search,
    searchParams.authors,
    searchParams.programs,
    searchParams.bugs,
    searchParams.onlyWithNotes,
    searchParams.onlyRead,
  ])

  const { data: writeups, isLoading } = api.writeups.getWriteups.useQuery({
    search: searchParams.search,
    authors: searchParams.authors,
    programs: searchParams.programs,
    bugs: searchParams.bugs,
    onlyWithNotes: searchParams.onlyWithNotes,
    onlyRead: searchParams.onlyRead,
    sortBy: searchParams.sortBy as "publishedAt" | "addedAt",
    sortOrder: searchParams.sortOrder as "asc" | "desc",
    page,
  })

  const { data: authors } = api.writeups.getUniqueAuthors.useQuery({
    search: authorSearch,
    page: 1,
  })

  const { data: programs } = api.writeups.getUniquePrograms.useQuery({
    search: programSearch,
    page: 1,
  })

  const { data: bugs } = api.writeups.getUniqueBugs.useQuery({
    search: bugSearch,
    page: 1,
  })

  return (
    <DataTableProvider<WriteupWithRelations>
      columns={columns(
        (value) =>
          setSearchParams({ authors: [...searchParams.authors, value] }),
        (value) =>
          setSearchParams({ programs: [...searchParams.programs, value] }),
        (value) => setSearchParams({ bugs: [...searchParams.bugs, value] })
      )}
      data={writeups?.items ?? []}
      isLoading={isLoading}
      total={writeups?.pageCount ?? 0}
    >
      {({ table, columns, data, total, isLoading }) => (
        <div className='space-y-4'>
          <div className='flex justify-between gap-4'>
            <SearchInput
              search={searchParams.search}
              onSearchChange={(value) => setSearchParams({ search: value })}
              authors={searchParams.authors}
              onAuthorAdd={(value) =>
                setSearchParams({ authors: [...searchParams.authors, value] })
              }
              onAuthorRemove={(value) =>
                setSearchParams({
                  authors: searchParams.authors.filter((a) => a !== value),
                })
              }
              programs={searchParams.programs}
              onProgramAdd={(value) =>
                setSearchParams({ programs: [...searchParams.programs, value] })
              }
              onProgramRemove={(value) =>
                setSearchParams({
                  programs: searchParams.programs.filter((p) => p !== value),
                })
              }
              bugs={searchParams.bugs}
              onBugAdd={(value) =>
                setSearchParams({ bugs: [...searchParams.bugs, value] })
              }
              onBugRemove={(value) =>
                setSearchParams({
                  bugs: searchParams.bugs.filter((b) => b !== value),
                })
              }
            />
          </div>
          <div className='flex justify-end gap-3'>
            {writeups && writeups.pageCount > 1 && (
              <div className='flex items-center justify-end space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <div className='text-sm'>
                  Page {page} of {writeups.pageCount}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setPage((p) => Math.min(writeups.pageCount, p + 1))
                  }
                  disabled={page === writeups.pageCount}
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            )}
            <div>
              <DataTableViewOptions table={table} />
            </div>
            <DownloadNotesButton />
          </div>
          <DataTable />
        </div>
      )}
    </DataTableProvider>
  )
}
