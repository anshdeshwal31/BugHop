"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UsageCardProps {
  prsUsed: number;
  prsCreated: number;
  issuesUsed: number;
  chatMessagesUsed: number;
  limits: {
    prs: number;
    prsCreated: number;
    issues: number;
    chat: number;
  };
}

function Progressbar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm">{label}</span>
        <span className="text-sm text-muted-foreground">
          {used}/{limit}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-[#127A4D] h-2 rounded-fu;;"
          style={{
            width: `${(used / (limit || 1)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

export function UsageCard({
  prsUsed,
  prsCreated,
  issuesUsed,
  chatMessagesUsed,
  limits,
}: UsageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage this month</CardTitle>
        <CardDescription>
          Your usage resets months from the signup date
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progressbar label="PR Reviews" used={prsUsed} limit={limits.prs} />
          <Progressbar
            label="PRs Created"
            used={prsCreated}
            limit={limits.prsCreated}
          />
          <Progressbar
            label="Issue Analyses"
            used={issuesUsed}
            limit={limits.issues}
          />
          <Progressbar
            label="Chat Messages"
            used={chatMessagesUsed}
            limit={limits.chat}
          />
        </div>
      </CardContent>
    </Card>
  );
}
