"use client"

import { Skeleton } from "~/components/ui/skeleton"

import { useSession } from "~/modules/common/hooks/use-session"
import EmailForm from "../form/email"

export function EmailSection() {
  const { data: session, isLoading } = useSession()

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <div className='space-y-2'>
        <h3 className='text-sm font-medium'>Email</h3>
        <p className='text-sm text-muted-foreground'>
          Update your email to keep your account secure.
        </p>
      </div>
      <div className='space-y-4'>
        <div className='grid gap-4'>
          {isLoading ? (
            <Skeleton className='h-[180px] w-full' />
          ) : (
            <EmailForm
              defaultValues={
                session?.data?.user?.email
                  ? { email: session.data.user.email }
                  : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
