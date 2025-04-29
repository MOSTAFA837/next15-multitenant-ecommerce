import { createTRPCRouter, baseProcedure } from "@/trpc/init";

import { Category } from "@/payload-types";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.payload.find({
      collection: "categories",
      where: {
        parent: {
          exists: false,
        },
      },
      depth: 1, // Populate subcategories
      pagination: false,
      sort: "name",
    });

    const formattedData = data.docs.map((doc) => ({
      ...doc,
      subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
        ...(doc as Category),
      })),
    }));

    return formattedData;
  }),
});
