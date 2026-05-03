"use client";

import { useEffect, useState } from "react";
import { useUsage } from "@/components/providers/usage-provider";
import { StatCard } from "./_components/stat-card";
import { ActivityChart } from "./_components/activity-chart";
import DashboardLoading from "./loading";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

interface DashboardData {
  user: {
    email: string;
    plan: "FREE" | "PRO";
    prsUsed: number;
    prsCreated: number;
    issuesUsed: number;
    chatMessagesUsed: number;
  };
  stats: {
    totalPrs: number;
    totalIssues: number;
    repoCount: number;
    repoName: string;
  };

  chartData: {
    date: string;
    pullRequest: number;
    issues: number;
  }[];

  limits: {
    FREE: {
      prs: number;
      prsCreated: number;
      issues: number;
      chat: number;
    };

    PRO: {
      prs: number;
      prsCreated: number;
      issues: number;
      chat: number;
    };
  };
}

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuthRedirect();
  const { getUsagePercentage } = useUsage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("90d");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("failed to fetch");
        setData(await res.json());
      } catch (error) {
        console.error("dashbord error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isSignedIn) {
      fetchData();
    }
  }, [isSignedIn]);

  if (!isLoaded || loading) {
    return <DashboardLoading />;
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="border border-dashed rounded-xl p-8 bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">No activity yet</h2>
          <p className="text-muted-foreground mb-6">
            Connect a GitHub repo and run your first review to populate your
            dashboard.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm font-medium mb-1">1. Connect GitHub</p>
              <p className="text-xs text-muted-foreground">
                Install the app and select a repository.
              </p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm font-medium mb-1">2. Start indexing</p>
              <p className="text-xs text-muted-foreground">
                Let BugHop learn your codebase structure.
              </p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm font-medium mb-1">3. Run a review</p>
              <p className="text-xs text-muted-foreground">
                Open a PR or issue and trigger analysis.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <a
              href="/settings"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Go to Settings
            </a>
          </div>
        </div>
      </div>
    );
  }

  const filteredChartData = data.chartData.filter((item) => {
    const date = new Date(item.date);
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    return date >= startDate;
  });

  const limits = data.limits[data.user.plan];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your code review activity
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="PRs Reviewed This Month"
          used={data.user.prsUsed}
          limit={limits.prs}
          percentage={getUsagePercentage("prs")}
        />
        <StatCard
          label="PRs created this month"
          used={data.user.prsCreated}
          limit={limits.prsCreated}
          percentage={getUsagePercentage("prsCreated")}
        />
        <StatCard
          label="issues analyzed this month"
          used={data.user.issuesUsed}
          limit={limits.issues}
          percentage={getUsagePercentage("issues")}
        />
        <StatCard
          label="chat messages this month"
          used={data.user.chatMessagesUsed}
          limit={limits.chat}
          percentage={getUsagePercentage("chat")}
        />
      </div>

      <ActivityChart
        chartData={filteredChartData}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
    </div>
  );
}
