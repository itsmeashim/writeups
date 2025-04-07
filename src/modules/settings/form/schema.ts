import { z } from "zod"

export const profileFormSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
})

export type ProfileFormSchema = z.infer<typeof profileFormSchema>

export const emailFormSchema = z.object({
  email: z.string().email(),
})

export type EmailFormSchema = z.infer<typeof emailFormSchema>

export const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(1),
    confirmNewPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
  })

export type PasswordFormSchema = z.infer<typeof passwordFormSchema>
