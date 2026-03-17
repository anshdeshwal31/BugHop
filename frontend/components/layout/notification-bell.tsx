"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import {
  useUnreadInboxNotificationsCount,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationContent } from "@/components/layout/notification-content";

function NotificationBadge() {
  const { count } = useUnreadInboxNotificationsCount();
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors cusror-pointer">
          <Bell className="w-5 h-5" />
          <ClientSideSuspense fallback={null}>
            <NotificationBadge />
          </ClientSideSuspense>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        align="start"
        side="right"
        sideOffset={8}
      >
        <ClientSideSuspense
          fallback={
            <div className="p-4 text-center text-muted-foreground">
              <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading...</p>
            </div>
          }
        >
          <NotificationContent />
        </ClientSideSuspense>
      </PopoverContent>
    </Popover>
  );
}
