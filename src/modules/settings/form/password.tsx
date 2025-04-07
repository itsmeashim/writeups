"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { type z } from "zod"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type BetterAuthError } from "better-auth"
import { toast } from "sonner"
import { PasswordInput } from "~/components/form/password-input"
import { Button } from "~/components/ui/button"
import { Form } from "~/components/ui/form"
import authClient from "~/lib/auth-client"
import { passwordFormSchema } from "./schema"

export default function PasswordForm() {
  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof passwordFormSchema>) => {
      const response = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      if (response.error) {
        throw new Error(response.error.message ?? "Failed to change password")
      }

      return true
    },
    onError: (error: BetterAuthError) => {
      form.setError("currentPassword", {
        message: error.message,
      })
    },
    onSuccess: async () => {
      toast.success("Password updated successfully")
      await queryClient.invalidateQueries({ queryKey: ["session"] })
    },
  })

  function onSubmit(values: z.infer<typeof passwordFormSchema>) {
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <PasswordInput
          label='Current Password'
          control={form.control}
          name='currentPassword'
        />
        <PasswordInput
          label='New Password'
          control={form.control}
          name='newPassword'
        />
        <PasswordInput
          label='Confirm New Password'
          control={form.control}
          name='confirmNewPassword'
        />
        <Button
          disabled={!form.formState.isDirty}
          loading={mutation.isPending}
          type='submit'
        >
          Update Password
        </Button>
      </form>
    </Form>
  )
}
