"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AccountCardProps {
  email: string | undefined;
  userId: string | undefined;
}

export function AccountCard({ email, userId }: AccountCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your account information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <p className="font-medium">{email}</p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">User ID</label>
            <p className="font-mono text-sm">{userId}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
