import { Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { type WriteupWithRelations } from "~/lib/types"
import { NoteModal } from "~/modules/writeups/components/note-modal"
import { api } from "~/trpc/react"

interface WriteupActionsProps {
  writeup: WriteupWithRelations
}

export function WriteupActions({ writeup }: WriteupActionsProps) {
  const utils = api.useUtils()

  const { mutate: toggleRead } = api.writeups.toggleRead.useMutation({
    onSuccess: () => {
      void utils.writeups.getWriteups.invalidate()
      void utils.writeups.totalReads.invalidate()
      if (!writeup.isRead) {
        toast.success("Writeup marked as read")
      } else {
        toast.success("Writeup marked as unread")
      }
    },
  })

  return (
    <div className='flex items-center gap-2'>
      <NoteModal writeupId={writeup.id} initialContent={writeup.note} />
      <Button
        variant='ghost'
        size='icon'
        onClick={() => toggleRead({ writeupId: writeup.id })}
        className={writeup.isRead ? "text-green-500" : ""}
      >
        <Check className='h-3 w-3' />
      </Button>
    </div>
  )
}
