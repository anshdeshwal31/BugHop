"use client";

import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status";

interface SystemStatusCardProps {
  backendStatus: "online" | "offline" | "degraded" | "maintenance";
  uptime: number | null;
}

export function SystemStatusCard({
  backendStatus,
  uptime,
}: SystemStatusCardProps) {
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <a
        href="https://allquiet.app/status/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Status
          status={backendStatus}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <StatusIndicator />
          <StatusLabel>
            {backendStatus === "online" && "All system operational"}
            {backendStatus === "offline" && "System Down"}
            {backendStatus === "degraded" && "System Degraded"}
            {backendStatus === "maintenance" && "Under maintenance"}
          </StatusLabel>
        </Status>
      </a>

      {uptime !== null && (
        <span className="text-xs text-muted-foreground">{uptime}% uptime</span>
      )}
    </div>
  );
}
