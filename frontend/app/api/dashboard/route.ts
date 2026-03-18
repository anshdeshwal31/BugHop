import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { getDashboardStats, buildChartData } from "@/lib/data/logs";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getDashboardStats(userId)

    const { user, installation, repositories, totalPRs, totalIssues, prsByDate, issuesByDate } = stats as any
    const chartData = buildChartData(prsByDate, issuesByDate)

    return NextResponse.json({
      user: {
        email: user.email,
        plan: user.plan,
        prsUsed: user.prsUsed,
        prsCreated: user.prsCreated,
        issuesUsed: user.issuesUsed,
        chatMessagesUsed: user.chatMessagesUsed,
        billingCycleStart: user.billingCycleStart
      },
      stats: {
        totalPRs,
        totalIssues,
        repoCount: repositories.length,
        repoName: repositories[0]?.fullName || "No repository connected",
        indexingStatus: repositories[0]?.indexingStatus || "NOT_STARTED",
        githubAccount: installation?.accountLogin|| null

      },
      chartData,
      limits: PLAN_LIMITS
    })
  } catch (error) {
    return NextResponse.json(
      { error: "internal server used" },
      { status: 500 })
  }
}
