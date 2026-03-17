import { SignedIn } from "@clerk/nextjs";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <SignedIn>
        <AppSidebar />
      </SignedIn>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
