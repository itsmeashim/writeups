"use client"

import { Loader2, UploadIcon } from "lucide-react"
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
  DialogTrigger,
} from "~/components/ui/dialog"
import { FloatingButton } from "~/components/ui/floating-button"
import { Input } from "~/components/ui/input"
import { api } from "~/trpc/react"

export default function WriteupsUploadModal() {
  const [open, setOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const utils = api.useUtils()
  const [isUploading, setIsUploading] = useState(false)
  const createFromJson = api.writeups.createFromJson.useMutation({
    onSuccess: (data) => {
      if (data.length === 0) {
        toast.info("No new writeups to add")
      } else {
        toast.success(
          `Successfully added ${data.length} new writeup${
            data.length === 1 ? "" : "s"
          }`
        )
        utils.writeups.getWriteups.invalidate()
      }
      setOpen(false)
      setFiles([])
      setIsUploading(false)
    },
    onError: (error) => {
      toast.error(error.message)
      setIsUploading(false)
    },
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const fileArray = Array.from(e.dataTransfer.files)
      setFiles(fileArray)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      setFiles(fileArray)
    }
  }

  const handleUpload = async () => {
    if (files.length > 0) {
      try {
        setIsUploading(true)
        const file = files[0]
        if (!file) {
          toast.error("No file selected")
          setIsUploading(false)
          return
        }
        const text = await file.text()
        const jsonData = JSON.parse(text)

        if (!jsonData.data || !Array.isArray(jsonData.data)) {
          toast.error("Invalid JSON format. Expected a 'data' array.")
          setIsUploading(false)
          return
        }

        createFromJson.mutate(jsonData.data)
      } catch (error) {
        toast.error("Invalid JSON file")
        setIsUploading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <FloatingButton
          size='icon'
          className='bg-blue-500 hover:bg-blue-600 text-white'
          position='bottom-right'
        >
          <UploadIcon />
        </FloatingButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Writeups</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Upload your writeups JSON file to the platform. Only new writeups will
          be added.
        </DialogDescription>

        <div className='relative'>
          {isUploading && (
            <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-10'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
            </div>
          )}
          <div
            className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon className='mx-auto h-12 w-12 text-gray-400' />
            <p className='mt-2 text-xs '>
              Drag and drop your JSON file here, or
            </p>
            <label
              htmlFor='file-upload'
              className='mt-2 cursor-pointer text-amber-400'
            >
              browse to upload
              <Input
                id='file-upload'
                type='file'
                className='hidden'
                onChange={handleFileChange}
                accept='.json'
                disabled={isUploading}
              />
            </label>

            {files.length > 0 && (
              <div className='mt-4 text-left'>
                <p className='font-medium'>Selected file:</p>
                <ul className='mt-2 text-sm'>
                  {files.map((file, index) => (
                    <li key={index} className='text-xs'>
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
