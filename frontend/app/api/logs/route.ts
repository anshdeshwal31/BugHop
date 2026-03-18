import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getFilteredLogs } from "@/lib/data/logs";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = req.nextUrl.searchParams;

    const type = params.get("type");
    const repoId = params.get("repoId");
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");

    const data = await getFilteredLogs(userId, {
      type,
      repoId,
      startDate,
      endDate,
    });

    if (!data) {
      return NextResponse.json(
        { logs: [], total: 0, repositories: [] },
        { status: 200 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "internal server used" },
      { status: 500 },
    );
  }
}
