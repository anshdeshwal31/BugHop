"use client";

import { useEffect, useState } from "react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useUsage } from "@/components/providers/usage-provider";
import { RuleForm } from "./_components/rule-form";
import { RuleList } from "./_components/rule-list";
import type { Rule } from "./_components/rule-list";

export default function RulesPage() {
  const { isSignedIn, isLoaded } = useAuthRedirect();
  const { usage } = useUsage();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRule, setNewRule] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetchRules();
    }
  }, [isSignedIn]);

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/rules");
      if (!res.ok) throw new Error("Failed to fetch rules");
      const data = await res.json();
      setRules(data.rules);
    } catch (err) {
      console.error("Error fetching rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.trim()) {
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newRule }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.Error || "Failed to create rule");
        return;
      }
      setRules([data.rule, ...rules]);
      setNewRule("");
    } catch (err) {
      setError("failed to create rule");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`/api/rules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (!res.ok) throw new Error("failed to update rule");

      const data = await res.json();
      setRules(rules.map((r) => (r.id === id ? data.rule : r)));
      setEditingId(null);
      setEditContent("");
    } catch (err) {
      console.error("error updating rule:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("are you sure you wanna to delete this rule?")) return;

    try {
      const res = await fetch(`/api/rules/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("failed to delete rule");

      setRules(rules.filter((r) => r.id !== id));
    } catch (err) {
      console.error("error deleting rule:", err);
    }
  };

  const startEditing = (rule: Rule) => {
    setEditingId(rule.id);
    setEditContent(rule.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  if (!isLoaded || loading) {
    return null;
  }

  const maxRules = usage?.plan === "PRO" ? 50 : 5;
  const canAddMore = rules.length < maxRules;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Custom Rules</h1>
        <p className="text-muted-foreground">
          Define rules in plain enlish. the ai will use these rules when
          reviewing your shit
        </p>
      </div>

      <RuleForm
        newRule={newRule}
        onNewRuleChange={setNewRule}
        onSubmit={handleCreate}
        creating={creating}
        canAddMore={canAddMore}
        rulesCount={rules.length}
        maxRules={maxRules}
        isFree={usage?.plan === "FREE"}
        error={error}
      />

      <RuleList
        rules={rules}
        editingId={editingId}
        editContent={editContent}
        onEditContentChange={setEditContent}
        onStartEditing={startEditing}
        onCancelEditing={cancelEditing}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
