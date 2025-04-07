import { z } from "zod"

export const registerFormSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Name is required"),
    confirmPassword: z.string().min(8, "Passwords do not match"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

export type RegisterFormSchema = z.infer<typeof registerFormSchema>
