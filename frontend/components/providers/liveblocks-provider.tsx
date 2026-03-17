"use client";

import { ReactNode } from "react";
import { LiveblocksProvider } from "@liveblocks/react/suspense";

export function LiveblocksWrapper({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      resolveUsers={async ({ userIds }) => {
        const response = await fetch("/api/users/batch", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({ userIds }),
        });
        if (response.ok) {
          const users = await response.json();
          return users;
        }
      }}
    >
      {children}
    </LiveblocksProvider>
  );
}
