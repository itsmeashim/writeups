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
import { type RegisterFormSchema, registerFormSchema } from "./schema"

import Link from "next/link"
import { useSession } from "~/modules/common/hooks/use-session"
import { useRegister } from "../../mutations/use-register"

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter()
  const { data: session } = useSession()

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      email: "",
      name: "",
      confirmPassword: "",
    },
    resolver: zodResolver(registerFormSchema),
  })

  const queryClient = useQueryClient()

  const mutation = useRegister()

  const handleSubmit = async (data: RegisterFormSchema) => {
    mutation.mutate(data, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["session"] })
        toast.success("Registration successful")
        window.location.reload()
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
        <TextInput label='Name' name='name' control={form.control} />
        <TextInput label='Email' name='email' control={form.control} />
        <TextInput label='Username' name='username' control={form.control} />
        <PasswordInput
          label='Password'
          name='password'
          control={form.control}
        />
        <PasswordInput
          label='Confirm Password'
          name='confirmPassword'
          control={form.control}
        />
      </div>
      <Button type='submit' className='w-full' loading={mutation.isPending}>
        Register
      </Button>
      <p className='text-center text-sm'>
        Already have an account?{" "}
        <Link href='/login' className='text-primary underline'>
          Login
        </Link>
      </p>
    </form>
  )
}
