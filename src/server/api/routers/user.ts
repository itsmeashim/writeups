import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

export const userRouter = createTRPCRouter({
  isAccountExists: publicProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.user.findFirst({})

    return !!user
  }),
})
