"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GithubCardProps {
  repoName: string | null;
  indexingStatus: string | null;
}

export function GithubCard({ repoName, indexingStatus }: GithubCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Github Integration</CardTitle>
        <CardDescription>Manage your github app instaallton</CardDescription>
      </CardHeader>
      <CardContent>
        {repoName && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Connected Repository
                </p>
                <p className="font-medium">{repoName}</p>
              </div>
              {indexingStatus && (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    indexingStatus === "COMPLETED"
                      ? "bg-[#127A4D]/10 text-[#127A4D]"
                      : indexingStatus === "INDEXING"
                        ? "bg-yellow-100 text-yellow-700"
                        : indexingStatus === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {indexingStatus === "COMPLETED"
                    ? "Indexed"
                    : indexingStatus === "INDEXING"
                      ? "Indexing..."
                      : indexingStatus === "FAILED"
                        ? "Failed"
                        : "Not Indexed"}
                </span>
              )}
            </div>
          </div>
        )}

        <p className="text-muted-foreground mb-4">
          Click below to manage or install your repositories
        </p>
        <Button variant="default" asChild>
          <a
            href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Manage Github App
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
