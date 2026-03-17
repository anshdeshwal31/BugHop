"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RuleFormProps {
  newRule: string;
  onNewRuleChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
  canAddMore: boolean;
  rulesCount: number;
  maxRules: number;
  isFree: boolean;
  error: string | null;
}

export function RuleForm({
  newRule,
  onNewRuleChange,
  onSubmit,
  creating,
  canAddMore,
  rulesCount,
  maxRules,
  isFree,
  error,
}: RuleFormProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add New Rule</CardTitle>
        <CardDescription>Write your rule in natural language.</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            value={newRule}
            onChange={(e) => onNewRuleChange(e.target.value)}
            placeholder="Use #127A4D for green styling"
            disabled={creating || !canAddMore}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex items-center justify-between">
            <span className="text-sm items-center justify-between">
              {rulesCount}/{maxRules} used
              {isFree && rulesCount >= 5 && (
                <span className="ml-2 text-[#127A4D]">
                  Upgrade to Pro for more rules
                </span>
              )}
            </span>

            <Button
              variant="default"
              type="submit"
              disabled={creating || !canAddMore}
            >
              {creating ? "Adding..." : "Add Rule"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
