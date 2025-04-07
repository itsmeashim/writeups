"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import logo from "~/../public/logo.png"
import { Alert } from "~/components/ui/alert"
import { Skeleton } from "~/components/ui/skeleton"
import { useSession } from "~/modules/common/hooks/use-session"
import { api } from "~/trpc/react"
import { LoginForm } from "../form/login/login"
import { RegisterForm } from "../form/register/register"

export default function AuthTemplate({
  allowRegistration,
}: {
  allowRegistration: boolean
}) {
  const { data: isAccountExists, isLoading } =
    api.user.isAccountExists.useQuery()
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.data?.user) {
      router.push("/")
    }
  }, [session?.data?.user])

  if (isLoading)
    return (
      <div className='flex flex-col gap-6'>
        <div>
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col items-center gap-2'>
              <Skeleton className='h-20 w-20 rounded-full' />
              <Skeleton className='h-8 w-48' />
              <Skeleton className='h-6 w-64' />
            </div>
            <div className='space-y-4'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>
        </div>
      </div>
    )

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col items-center gap-2'>
            <Link href='/' className='flex  mb-3'>
              <Image src={logo} alt='Writeups' width={100} height={100} />
            </Link>
            <h1 className='text-center text-xl font-bold'>
              {isAccountExists
                ? "Welcome Back,"
                : "Create an account and start using the app"}
            </h1>
          </div>
          {session?.data?.user && (
            <Alert variant='destructive' className='w-full'>
              <div className='flex flex-col w-full'>
                <h4 className='font-medium'>
                  Welcome Back, {session.data.user.name}
                </h4>
                <p className='text-sm'>
                  You&apos;re already logged in. Redirecting to dashboard...
                </p>
              </div>
            </Alert>
          )}
          {isAccountExists ? (
            <LoginForm allowRegistration={allowRegistration} />
          ) : (
            <RegisterForm />
          )}
        </div>
      </div>
    </div>
  )
}
