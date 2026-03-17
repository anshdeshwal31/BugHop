import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://allquiet.app/status/coderabbit6767/status.json",
      {
        signal: AbortSignal.timeout(5000),
      },
    );

    const data = await res.json();

    const statusMap: Record<string, string> = {
      Operational: "online",
      Degraded: "degraded",
      Downtime: "offline",
      Maintenance: "maintenance",
    };

    const status = statusMap[data.status] || "offline";
    const uptimeValue = data.calculation.results?.[0].result.uptime;
    const uptime = Math.round(uptimeValue * 10000) / 100;

    return NextResponse.json({ status, uptime });
  } catch (error) {
    return NextResponse.json({ status: "offline", uptime: null });
  }
}
