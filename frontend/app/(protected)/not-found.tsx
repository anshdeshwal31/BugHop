import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
      <h2 className="text-xl font-semibold">Page not found lol</h2>
      <p className="text-muted-foreground">
        the page youre looking for doesnt exissit lil bro
      </p>
      <Link href="/dashboard">
        <Button variant="outline">Go to dashboard</Button>
      </Link>
    </div>
  );
}
