import { headers as getHeaders, cookies as getCookies } from "next/headers";

import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { AUTH_COOKIE } from "../constants";
import { loginSchema, registerSchema } from "../schemas";

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

        console.log("data from server", data); // Add this to inspect
        const cookies = await getCookies();
        cookies.set({
          name: AUTH_COOKIE,
          value: data.token,
          httpOnly: true,
          path: "/",
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

    const cookies = await getCookies();
    cookies.set({
      name: AUTH_COOKIE,
      value: data.token,
      httpOnly: true,
      path: "/",
    });

    return data;
  }),
  logout: baseProcedure.mutation(async () => {
    const cookies = await getCookies();
    cookies.delete(AUTH_COOKIE);
  }),
});
