"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartConfig = {
  pullRequests: { label: "Pull Request", color: "#127A4D" },
  issues: { label: "Issues", color: "#0d5636" },
} satisfies ChartConfig;

interface ActivityChartProps {
  chartData: { date: string; pullRequests: number; issues: number }[];
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
}

export function ActivityChart({
  chartData,
  timeRange,
  onTimeRangeChange,
}: ActivityChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>PRs and Issues analyzed over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-6 pb-2">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillPRs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#127A4D" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#127A4D" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillIssues" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d5636" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0d5636" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="issues"
              type="natural"
              fill="url(#fillIssues)"
              stroke="#0d5636"
              stackId="a"
            />
            <Area
              dataKey="pullRequests"
              type="natural"
              fill="url(#fillPRs)"
              stroke="#127A4D"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
