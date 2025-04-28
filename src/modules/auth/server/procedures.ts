import { headers as getHeaders } from "next/headers";

import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { loginSchema, registerSchema } from "../schemas";
import { generateAuthCookie } from "../utils";

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();

    const session = await ctx.payload.auth({ headers });

    console.log("session", session);
    return session;
  }),
  register: baseProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const existingData = await ctx.payload.find({
          collection: "users",
          limit: 1,
          where: {
            username: {
              equals: input.username,
            },
          },
        });

        const existingUser = existingData.docs[0];

        if (existingUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Username already exists",
          });
        }

        await ctx.payload.create({
          collection: "users",
          data: {
            email: input.email,
            password: input.password,
            username: input.username,
          },
        });

        const data = await ctx.payload.login({
          collection: "users",
          data: {
            email: input.email,
            password: input.password,
          },
        });

        if (!data.token) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        await generateAuthCookie({
          prefix: ctx.payload.config.cookiePrefix,
          value: data.token,
        });
      } catch (error) {
        console.error("Error in register mutation", error); // Add this to inspect any errors
        throw error;
      }
    }),
  login: baseProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const data = await ctx.payload.login({
      collection: "users",
      data: {
        email: input.email,
        password: input.password,
      },
    });

    if (!data.token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    await generateAuthCookie({
      prefix: ctx.payload.config.cookiePrefix,
      value: data.token,
    });

    return data;
  }),
});
