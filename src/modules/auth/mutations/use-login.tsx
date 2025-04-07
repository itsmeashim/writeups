import { useMutation } from "@tanstack/react-query"
import authClient from "~/lib/auth-client"
import type { LoginFormSchema } from "../form/login/schema"

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginFormSchema) => {
      const result = await authClient.signIn.username({
        username: data.username,
        password: data.password,
      })

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to login")
      }

      return result.data
    },
  })
}
