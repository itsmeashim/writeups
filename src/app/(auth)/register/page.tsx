import Link from "next/link"
import RegisterTemplate from "~/modules/auth/templates/register"

export default function RegisterPage() {
  const allowRegistration = process.env.ALLOW_REGISTRATION === "true"
  if (!allowRegistration) {
    return (
      <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10'>
        <div className='w-full max-w-sm flex flex-col gap-4 items-center'>
          <div className='text-center space-y-2'>
            <h1 className='text-2xl font-bold'>Registration Disabled</h1>
            <p className='text-muted-foreground'>
              Registration is currently not allowed on this platform.
            </p>
          </div>
          <div className='w-full'>
            <Link href='/login' className='w-full'>
              <button className='w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium'>
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <RegisterTemplate />
      </div>
    </div>
  )
}
