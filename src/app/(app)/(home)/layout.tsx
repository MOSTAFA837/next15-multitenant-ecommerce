import { getPayload } from "payload";
import configPromise from "@payload-config";

import Footer from "./footer";
import Navbar from "./navbar";
import SearchFilters from "./search-filters";
import { Category } from "@/payload-types";
import { CustomCategory } from "./types";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const payload = await getPayload({
    config: configPromise,
  });

  const data = await payload.find({
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

  const formattedData: CustomCategory[] = data.docs.map((doc) => ({
    ...doc,
    subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
      ...(doc as Category),
      subcategories: undefined,
    })),
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <SearchFilters data={formattedData} />
      <div className="flex-1 bg-[#f4f4f0]">{children}</div>
      <Footer />
    </div>
  );
}
