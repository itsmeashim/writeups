import { useMutation } from "@tanstack/react-query"
import authClient from "~/lib/auth-client"
import type { RegisterFormSchema } from "../form/register/schema"

export const useRegister = () =>
  useMutation({
    mutationFn: async (data: RegisterFormSchema) => {
      const result = await authClient.signUp.email({
        username: data.username,
        password: data.password,
        email: data.email,
        name: data.name,
      })

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to register")
      }

      return result.data
    },
  })
