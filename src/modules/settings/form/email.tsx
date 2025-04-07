"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type BetterAuthError } from "better-auth"
import { toast } from "sonner"
import { TextInput } from "~/components/form/text-input"
import { Button } from "~/components/ui/button"
import { Form } from "~/components/ui/form"
import authClient from "~/lib/auth-client"
import { emailFormSchema, type EmailFormSchema } from "./schema"

interface EmailFormProps {
  defaultValues?: EmailFormSchema
}

export default function EmailForm({ defaultValues }: EmailFormProps) {
  const form = useForm<EmailFormSchema>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: defaultValues ?? {
      email: "",
    },
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: EmailFormSchema) => {
      const response = await authClient.changeEmail({
        newEmail: values.email,
      })

      if (response.error) {
        throw new Error(response.error.message ?? "Failed to update profile")
      }

      return response.data
    },
    onError: (res: BetterAuthError) => {
      form.setError("email", {
        message: res.message,
      })
    },
    onSuccess: async () => {
      toast.success("Email updated successfully")
      await queryClient.invalidateQueries({ queryKey: ["session"] })
    },
  })

  function onSubmit(values: EmailFormSchema) {
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <TextInput label='Email' control={form.control} name='email' />
        <Button
          disabled={!form.formState.isDirty}
          type='submit'
          loading={mutation.isPending}
        >
          Save Changes
        </Button>
      </form>
    </Form>
  )
}
