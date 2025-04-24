import { Category } from "@/payload-types";
import CategoryDropdown from "./category-dropdown";

interface Props {
  data: any;
}

export default function Categories({ data }: Props) {
  return (
    <div className="relative">
      <div className="flex flex-nowrap items-center">
        {data.map((category: Category) => (
          <div key={category.id}>
            <CategoryDropdown
              category={category}
              isActive={false}
              isNavigationHovered={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
