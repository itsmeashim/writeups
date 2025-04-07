import { Download } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { FloatingButton } from "~/components/ui/floating-button"
import { api } from "~/trpc/react"

export function DownloadNotesButton() {
  const { mutate: getWriteupsWithNotes, isPending } =
    api.writeups.getWriteupsWithNotes.useMutation()
  const [isDownloading, setIsDownloading] = useState(false)
  const handleDownload = () => {
    setIsDownloading(true)
    getWriteupsWithNotes(undefined, {
      onSuccess: (data) => {
        if (data.length === 0) {
          toast.error("No writeups with notes found")
          setIsDownloading(false)
          return
        }
        const content = data
          .map((writeup) => {
            const formattedDate = (date: Date | null) =>
              date ? new Date(date).toLocaleDateString() : "N/A"

            return `${writeup.title}[${writeup.link}]
Author: ${writeup.authors?.join(", ") || "N/A"}
Programs: ${writeup.programs?.join(", ") || "N/A"}
Bugs: ${writeup.bugs?.join(", ") || "N/A"}
Bounty: ${writeup.bounty || "N/A"}
Published At: ${formattedDate(writeup.publishedAt)}
Added At: ${formattedDate(writeup.addedAt)}

${writeup.notes}
----`
          })
          .join("\n\n")

        const blob = new Blob([content], { type: "text/markdown" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `writeup-notes-${new Date().toLocaleDateString()}.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setIsDownloading(false)
      },
    })
  }

  return (
    <FloatingButton
      loading={isDownloading || isPending}
      variant='secondary'
      size='icon'
      position='bottom-right'
      className='bottom-16'
      onClick={handleDownload}
    >
      <Download className='h-6 w-6' />
    </FloatingButton>
  )
}
