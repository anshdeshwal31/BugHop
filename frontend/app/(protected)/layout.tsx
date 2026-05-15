import { SignedIn } from "@clerk/nextjs";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppFooter } from "@/components/layout/app-footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <div className="app-shell-grid" />
      <div className="app-shell-noise" />
      <SignedIn>
        <AppSidebar />
      </SignedIn>
      <main className="app-main flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <AppFooter />
      </main>
    </div>
  );
}
