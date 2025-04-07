import { BookMarked, Check, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command"
import { Input } from "~/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useWriteupsSearch } from "~/hooks/use-writeups-search"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

interface SearchInputProps {
  search: string
  onSearchChange: (value: string) => void
  authors: string[]
  onAuthorAdd: (value: string) => void
  onAuthorRemove: (value: string) => void
  programs: string[]
  onProgramAdd: (value: string) => void
  onProgramRemove: (value: string) => void
  bugs: string[]
  onBugAdd: (value: string) => void
  onBugRemove: (value: string) => void
}

export function SearchInput({
  search,
  onSearchChange,
  authors,
  onAuthorAdd,
  onAuthorRemove,
  programs,
  onProgramAdd,
  onProgramRemove,
  bugs,
  onBugAdd,
  onBugRemove,
}: SearchInputProps) {
  const [authorOpen, setAuthorOpen] = useState(false)
  const [programOpen, setProgramOpen] = useState(false)
  const [bugOpen, setBugOpen] = useState(false)

  const [searchParams, setSearchParams] = useWriteupsSearch()

  const [authorSearch, setAuthorSearch] = useState("")
  const [programSearch, setProgramSearch] = useState("")
  const [bugSearch, setBugSearch] = useState("")

  const { data: uniqueAuthors } = api.writeups.getUniqueAuthors.useQuery({
    search: authorSearch,
    page: 1,
  })
  const { data: uniquePrograms } = api.writeups.getUniquePrograms.useQuery({
    search: programSearch,
    page: 1,
  })
  const { data: uniqueBugs } = api.writeups.getUniqueBugs.useQuery({
    search: bugSearch,
  })
  const { data: totalNotes } = api.writeups.totalNotes.useQuery()
  const { data: totalReads } = api.writeups.totalReads.useQuery()

  const filteredAuthors = uniqueAuthors?.items.filter(
    (author) =>
      author.toLowerCase().includes(authorSearch.toLowerCase()) &&
      !authors.includes(author)
  )

  const filteredPrograms = uniquePrograms?.items.filter(
    (program) =>
      program.toLowerCase().includes(programSearch.toLowerCase()) &&
      !programs.includes(program)
  )

  const filteredBugs = uniqueBugs?.items.filter(
    (bug) =>
      bug.toLowerCase().includes(bugSearch.toLowerCase()) && !bugs.includes(bug)
  )

  useEffect(() => {
    if (!authorOpen) {
      setAuthorSearch("")
    }
  }, [authorOpen])

  useEffect(() => {
    if (!programOpen) {
      setProgramSearch("")
    }
  }, [programOpen])

  useEffect(() => {
    if (!bugOpen) {
      setBugSearch("")
    }
  }, [bugOpen])

  return (
    <div className='space-y-4 w-full'>
      <div className='flex flex-col w-full gap-2'>
        <div className='flex flex-col md:flex-row gap-2 items-start md:items-center'>
          <Input
            placeholder='Search writeups...'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className='w-full'
          />
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto'>
            <Select
              value={searchParams.sortBy}
              onValueChange={(value) =>
                setSearchParams({ ...searchParams, sortBy: value })
              }
            >
              <SelectTrigger className='w-full sm:w-[180px]'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='publishedAt'>Published Date</SelectItem>
                <SelectItem value='addedAt'>Added Date</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={searchParams.sortOrder}
              onValueChange={(value) =>
                setSearchParams({ ...searchParams, sortOrder: value })
              }
            >
              <SelectTrigger className='w-full sm:w-[180px]'>
                <SelectValue placeholder='Sort order' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='desc'>Newest first</SelectItem>
                <SelectItem value='asc'>Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Popover open={authorOpen} onOpenChange={setAuthorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='w-full sm:w-[150px] justify-between'
              >
                Search Author
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[200px] p-0' align='start'>
              <Command>
                <CommandInput
                  placeholder='Search authors...'
                  value={authorSearch}
                  onValueChange={setAuthorSearch}
                />
                <CommandGroup>
                  <ScrollArea className='h-[200px]'>
                    {filteredAuthors?.map((author) => (
                      <CommandItem
                        key={author}
                        onSelect={() => {
                          onAuthorAdd(author)
                          setAuthorOpen(false)
                        }}
                      >
                        {author}
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Popover open={programOpen} onOpenChange={setProgramOpen}>
            <PopoverTrigger asChild>
              <Button
                size='sm'
                variant='outline'
                className='w-full sm:w-[150px] justify-between'
              >
                Search Program
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[200px] p-0' align='start'>
              <Command>
                <CommandInput
                  placeholder='Search programs...'
                  value={programSearch}
                  onValueChange={setProgramSearch}
                />
                <CommandGroup>
                  <ScrollArea className='h-[200px]'>
                    {filteredPrograms?.map((program) => (
                      <CommandItem
                        key={program}
                        onSelect={() => {
                          onProgramAdd(program)
                          setProgramOpen(false)
                        }}
                      >
                        {program}
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Popover open={bugOpen} onOpenChange={setBugOpen}>
            <PopoverTrigger asChild>
              <Button
                size='sm'
                variant='outline'
                className='w-full sm:w-[150px] justify-between'
              >
                Search Bug
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[200px] p-0' align='start'>
              <Command>
                <CommandInput
                  placeholder='Search bugs...'
                  value={bugSearch}
                  onValueChange={setBugSearch}
                />
                <CommandGroup>
                  <ScrollArea className='h-[200px]'>
                    {filteredBugs?.map((bug) => (
                      <CommandItem
                        key={bug}
                        onSelect={() => {
                          onBugAdd(bug)
                          setBugOpen(false)
                        }}
                      >
                        {bug}
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            size='sm'
            variant={searchParams.onlyWithNotes ? "default" : "outline"}
            className='w-full sm:w-auto gap-2'
            onClick={() =>
              setSearchParams({
                onlyWithNotes: !searchParams.onlyWithNotes,
              })
            }
          >
            <BookMarked className='h-4 w-4' />
            With Notes
            <span
              className={cn(
                "px-2 py-0.5 text-xs rounded-full bg-secondary",
                searchParams.onlyWithNotes && " text-white"
              )}
            >
              {totalNotes ?? 0}
            </span>
          </Button>
          <Button
            size='sm'
            variant={searchParams.onlyRead ? "default" : "outline"}
            className='w-full sm:w-auto gap-2'
            onClick={() =>
              setSearchParams({
                onlyRead: !searchParams.onlyRead,
              })
            }
          >
            <Check className='h-4 w-4' />
            Read
            <span
              className={cn(
                "px-2 py-0.5 text-xs rounded-full bg-secondary",
                searchParams.onlyRead && " text-white"
              )}
            >
              {totalReads ?? 0}
            </span>
          </Button>
        </div>
      </div>

      <div className='flex flex-wrap gap-2'>
        {authors.map((author) => (
          <div
            key={author}
            className={cn(
              "inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm",
              "hover:bg-secondary/80"
            )}
          >
            {author}
            <Button
              variant='ghost'
              size='icon'
              className='h-4 w-4 p-0 hover:bg-transparent'
              onClick={() => onAuthorRemove(author)}
            >
              <X className='h-3 w-3' />
            </Button>
          </div>
        ))}
        {programs.map((program) => (
          <div
            key={program}
            className={cn(
              "inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm",
              "hover:bg-secondary/80"
            )}
          >
            {program}
            <Button
              variant='ghost'
              size='icon'
              className='h-4 w-4 p-0 hover:bg-transparent'
              onClick={() => onProgramRemove(program)}
            >
              <X className='h-3 w-3' />
            </Button>
          </div>
        ))}
        {bugs.map((bug) => (
          <div
            key={bug}
            className={cn(
              "inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm",
              "hover:bg-secondary/80"
            )}
          >
            {bug}
            <Button
              variant='ghost'
              size='icon'
              className='h-4 w-4 p-0 hover:bg-transparent'
              onClick={() => onBugRemove(bug)}
            >
              <X className='h-3 w-3' />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
