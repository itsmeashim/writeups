import AppLayout from "~/modules/common/layouts/app-layout"
import NotesUploadModal from "~/modules/writeups/components/upload-modal"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AppLayout>
      <NotesUploadModal />
      {children}
    </AppLayout>
  )
}
