import { useMutation } from "@tanstack/react-query"
import authClient from "~/lib/auth-client"

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut()

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to logout")
      }

      return result.data
    },
  })
}
