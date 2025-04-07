"use client"

import Editor from "@monaco-editor/react"
import { Pencil } from "lucide-react"
import { useState } from "react"
import Markdown from "react-markdown"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

interface NoteModalProps {
  writeupId: number
  initialContent?: string | null
}

export function NoteModal({ writeupId, initialContent }: NoteModalProps) {
  const [content, setContent] = useState(initialContent ?? "")
  const [isOpen, setIsOpen] = useState(false)
  const utils = api.useUtils()

  const { mutate: createNote } = api.writeups.createNote.useMutation({
    onSuccess: () => {
      setIsOpen(false)
      void utils.writeups.getWriteups.invalidate()
      void utils.writeups.totalNotes.invalidate()
      toast.success("Note saved")
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='icon'>
          <Pencil
            className={cn(
              "h-3 w-3",
              initialContent ? "text-green-500" : "text-muted-foreground"
            )}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-[90vw] sm:max-w-[90vw] bg-background'>
        <DialogHeader>
          <DialogTitle>Write Note</DialogTitle>
        </DialogHeader>
        <div className='h-[600px]'>
          <Tabs defaultValue='write' className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='write'>Write</TabsTrigger>
              <TabsTrigger value='preview'>Preview</TabsTrigger>
            </TabsList>
            <TabsContent value='write' className='flex-none h-[500px]'>
              <Editor
                defaultLanguage='markdown'
                value={content}
                onChange={(value: string | undefined) =>
                  setContent(value ?? "")
                }
                theme='vs-dark'
                options={{
                  minimap: { enabled: false },
                  wordWrap: "on",
                }}
              />
            </TabsContent>
            <TabsContent
              value='preview'
              className=' overflow-auto  h-[500px] max-w-full prose prose-invert'
            >
              <ScrollArea className='h-[500px] w-full'>
                <Markdown>{content}</Markdown>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <div className='mt-4 flex justify-end'>
            <Button onClick={() => createNote({ writeupId, note: content })}>
              Save Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
