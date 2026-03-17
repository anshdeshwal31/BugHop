"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sun, Moon, Crown, LogOut, Github } from "lucide-react";
import {
  DashboardIcon,
  ChatIcon,
  LogsIcon,
  RulesIcon,
  SettingsIcon,
} from "@/components/icons/sidebar-icons";
import { useUser, useClerk } from "@clerk/nextjs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsage } from "@/components/providers/usage-provider";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: DashboardIcon },
  { title: "Chat", url: "/chat", icon: ChatIcon },
  { title: "Logs", url: "/logs", icon: LogsIcon },
  { title: "Rules", url: "/rules", icon: RulesIcon },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { usage, loading: usageLoading } = useUsage();
  const [mounted, setMounted] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPro = usage?.plan === "PRO";

  return (
    <aside className="w-64 h-screen sticky top-0 border-r bg-background  flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#127A4D] to-[#0d5636] flex items-center justify-center flex-shrink-0">
            <Github className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            {usageLoading ? (
              <>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-3 w-28" />
              </>
            ) : usage?.githubAccount ? (
              <>
                <p className="font-semibold truncate">{usage.githubAccount}</p>
                <p className="text-xs text-muted-foreground">
                  Github Connected
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">CodeRabbit</p>
                <p className="text-xs text-muted-foreground">AI Code Reviews</p>
              </>
            )}
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.url;
            return (
              <li key={item.title}>
                <Link
                  href={item.url}
                  className={`flex item-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-gradient-to-b from-[#127A4D] to-[#0d5636] text-white"
                      : "hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t space-y-4">
        {usageLoading || !user ? (
          <>
            <div className="px-2 space-y-2">
              <div className="flex justofy-between">
                <div className="h-4 w-24 bg-muted rouded animate-pulse" />
                <div className="h-4 w-12 bg-muted rouded animate-pulse" />
              </div>
              <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
            </div>

            <div className="px-2 space-y-2">
              <div className="h-4 w-20 bg-muted rouded animate-pulse" />
              <div className="h-8 w-full bg-muted rouded animate-pulse" />
            </div>

            <div className="px-2 flex justify-between items-center">
              <div className="h-4 w-24 bg-muted rouded animate-pulse" />
              <div className="h-5 w-full bg-muted rouded-full animate-pulse" />
            </div>

            <div className="px-2">
              <div className="p-2 gap-2 flex items-center">
                <div className="h-6 w-6 bg-muted rouded-full animate-pulse" />
                <div className="h-4 flex-1 bg-muted rouded animate-pulse" />
              </div>
            </div>
          </>
        ) : (
          <>
            {usage && (
              <div className="px-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Chat Messages</span>
                  <span className="font-medium">
                    {usage.chatMessagesUsed} / {usage.limits[usage.plan].chat}
                  </span>
                </div>

                <div className="w-full h-2 bg-muted rounded-full">
                  <div
                    className="h-2 bg-[#127A4D] rounded-full transition-all"
                    style={{
                      width: `${(usage.chatMessagesUsed / usage.limits[usage.plan].chat) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="px-2">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isPro ? "Pro Plan" : "Free Plan"}
                </span>
              </div>
              <Link href="/settings">
                <Button variant="default" size="sm" className="w-full">
                  {isPro ? "Manage Subscriptio" : "Upgrade to Pro"}
                </Button>
              </Link>

              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  {mounted &&
                    (resolvedTheme === "dark" ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    ))}
                  <span className="text-sm">Dark Mode</span>
                </div>

                <Switch
                  checked={mounted && resolvedTheme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              </div>

              <div className="relative px-2">
                <button
                  onClick={() => setShowSignOut(!showSignOut)}
                  className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  {user?.imageUrl && (
                    <img
                      src={user.imageUrl}
                      alt="users profile image"
                      className="w-6 h-6 rounded-full"
                    />
                  )}

                  <span className="text-sm truncate flex-1 text-left">
                    {user?.primaryEmailAddress?.emailAddress}
                  </span>
                </button>

                {showSignOut && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 mx-2">
                    <button onClick={() => signOut({ redirectUrl: "/" })}>
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
