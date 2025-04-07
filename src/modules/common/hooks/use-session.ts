import { useQuery } from "@tanstack/react-query"
import authClient from "~/lib/auth-client"

export const useSession = () => {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  })
}
