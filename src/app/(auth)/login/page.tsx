import AuthTemplate from "~/modules/auth/templates"

export default function LoginPage() {
  const allowRegistration = process.env.ALLOW_REGISTRATION === "true"
  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <AuthTemplate allowRegistration={allowRegistration} />
      </div>
    </div>
  )
}
