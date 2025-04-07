"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { type z } from "zod"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type BetterAuthError } from "better-auth"
import { toast } from "sonner"
import { TextInput } from "~/components/form/text-input"
import { Button } from "~/components/ui/button"
import { Form } from "~/components/ui/form"
import authClient from "~/lib/auth-client"
import { profileFormSchema } from "./schema"

interface ProfileFormProps {
  defaultValues?: z.infer<typeof profileFormSchema>
}

export default function ProfileForm({ defaultValues }: ProfileFormProps) {
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaultValues ?? {
      name: "",
      username: "",
    },
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileFormSchema>) => {
      const response = await authClient.updateUser({
        name: values.name,
        username:
          values.username === defaultValues?.username
            ? undefined
            : values.username,
      })

      if (response.error) {
        throw new Error(response.error.message ?? "Failed to update profile")
      }

      return response.data
    },
    onError: (res: BetterAuthError) => {
      form.setError("username", {
        message: res.message,
      })
    },
    onSuccess: async () => {
      toast.success("Profile updated successfully")
      await queryClient.invalidateQueries({ queryKey: ["session"] })
    },
  })

  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <TextInput label='Name' control={form.control} name='name' />
        <TextInput label='Username' control={form.control} name='username' />
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
