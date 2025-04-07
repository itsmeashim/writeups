"use client"

import { Skeleton } from "~/components/ui/skeleton"

import { useSession } from "~/modules/common/hooks/use-session"
import ProfileForm from "../form/profile"

export function ProfileSection() {
  const { data: session, isLoading } = useSession()

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <div className='space-y-2'>
        <h3 className='text-sm font-medium'>Personal Information</h3>
        <p className='text-sm text-muted-foreground'>
          Manage your personal details and how others see you on the platform.
        </p>
      </div>
      <div className='space-y-4'>
        <div className='grid gap-4'>
          {isLoading ? (
            <Skeleton className='h-[180px] w-full' />
          ) : (
            <ProfileForm
              defaultValues={
                session?.data?.user as {
                  username: string
                  name: string
                }
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
