"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useWriteupsSearch } from "~/hooks/use-writeups-search"
import { api } from "~/trpc/react"
import { DeleteAllModal } from "../components/delete-all-modal"
import { WriteupsTable } from "../table/table"

export default function WriteupsTemplate() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [searchParams, setSearchParams] = useWriteupsSearch()
  const utils = api.useUtils()

  const fetchMutation = api.writeups.fetchAndCreateFromJson.useMutation({
    onSuccess: (result) => {
      if (result.count > 0) {
        toast.success(
          `${result.count} writeups fetched and created successfully`
        )
        void utils.writeups.getWriteups.invalidate()
      } else {
        toast.error("No new writeups found")
      }
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <div className='container mx-auto py-10'>
      <div className='flex md:items-center gap-4 flex-col md:flex-row justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Writeups</h1>
          <p className='text-muted-foreground'>
            A collection of writeups from various bug bounty programs
          </p>
        </div>
        <div className='gap-2 flex items-center'>
          {/* <Button
            variant='destructive'
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete All
          </Button> */}
          <Button
            variant='outline'
            loading={fetchMutation.isPending}
            onClick={() => fetchMutation.mutate()}
          >
            Fetch From Site
          </Button>
        </div>
      </div>

      <Card className='mt-8'>
        <CardHeader>
          <CardTitle>All Writeups</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <WriteupsTable />
        </CardContent>
      </Card>

      <DeleteAllModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      />
    </div>
  )
}
