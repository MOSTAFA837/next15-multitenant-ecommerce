import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  return (
    <div className="p-4">
      <div>
        <Button variant="elevated">I am button</Button>
      </div>
      <div>
        <Input />
      </div>
      <div>
        <Progress value={50} />
      </div>
      <div>
        <Checkbox />
      </div>
    </div>
  );
}
