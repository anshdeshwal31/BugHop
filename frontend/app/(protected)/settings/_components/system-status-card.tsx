"use client";

import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status";

type ServiceStatus = {
  status?: string;
  detail?: string;
};

interface SystemStatusCardProps {
  backendStatus: "online" | "offline" | "degraded" | "maintenance";
  uptime: number | null;
  services?: Record<string, ServiceStatus>;
}

export function SystemStatusCard({
  backendStatus,
  uptime,
  services = {},
}: SystemStatusCardProps) {
  const serviceEntries = Object.entries(services);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-center gap-3">
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

      {serviceEntries.length > 0 && (
        <div className="mt-3 text-xs text-muted-foreground space-y-1 text-center">
          {serviceEntries.map(([serviceName, service]) => (
            <div key={serviceName}>
              {serviceName}: {service.status || "unknown"}
              {service.detail ? ` - ${service.detail}` : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
