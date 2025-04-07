"use client"

import { useForm } from "react-hook-form"
import { PasswordInput } from "~/components/form/password-input"
import { TextInput } from "~/components/form/text-input"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { type LoginFormSchema, loginFormSchema } from "./schema"

import Link from "next/link"
import { useSession } from "~/modules/common/hooks/use-session"
import { useLogin } from "../../mutations/use-login"

export function LoginForm({
  allowRegistration,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  allowRegistration: boolean
}) {
  const router = useRouter()
  const { data: session } = useSession()

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: zodResolver(loginFormSchema),
  })

  const queryClient = useQueryClient()

  const mutation = useLogin()

  const handleSubmit = async (data: LoginFormSchema) => {
    mutation.mutate(data, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["session"] })
        toast.success("Login successful")
        router.push("/")
      },
      onError: (error) => {
        form.setError("username", {
          message: error.message,
        })
      },
    })
  }

  useEffect(() => {
    if (session?.data?.user) {
      router.push("/")
    }
  }, [session?.data?.user, router])

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className='flex flex-col gap-6'
    >
      <div className='grid gap-3'>
        <TextInput label='Username' name='username' control={form.control} />
        <PasswordInput
          label='Password'
          name='password'
          control={form.control}
        />
      </div>
      <Button type='submit' className='w-full' loading={mutation.isPending}>
        Login
      </Button>
      {allowRegistration && (
        <p className='text-center text-sm'>
          Don&apos;t have an account?{" "}
          <Link href='/register' className='text-primary underline'>
            Register
          </Link>
        </p>
      )}
    </form>
  )
}
