import { z } from "zod"

export const loginFormSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
})

export type LoginFormSchema = z.infer<typeof loginFormSchema>
