"use client"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import UserButton from "~/modules/auth/components/user-button"
interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <NuqsAdapter>
      {children}
      <UserButton />
    </NuqsAdapter>
  )
}
