import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { api } from "~/trpc/react"

interface DeleteAllModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAllModal({ open, onOpenChange }: DeleteAllModalProps) {
  const [confirmText, setConfirmText] = useState("")

  const utils = api.useUtils()

  const deleteAllMutation = api.writeups.deleteAll.useMutation({
    onSuccess: () => {
      toast.success("All writeups have been deleted")
      onOpenChange(false)
      setConfirmText("")
      void utils.writeups.getWriteups.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = () => {
    if (confirmText !== "delete all") return
    deleteAllMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete All Writeups</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please type &quot;delete all&quot; to
            confirm.
          </DialogDescription>
        </DialogHeader>
        <div className='py-6'>
          <Input
            placeholder="Type 'delete all' to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={deleteAllMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={
              confirmText !== "delete all" || deleteAllMutation.isPending
            }
          >
            {deleteAllMutation.isPending ? "Deleting..." : "Delete All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
