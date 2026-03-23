"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useUsage } from "@/components/providers/usage-provider";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { AccountCard } from "./_components/account-card";
import { SubscriptionCard } from "./_components/subscription-card";
import { UsageCard } from "./_components/usage-card";
import { GithubCard } from "./_components/github-card";
import { SystemStatusCard } from "./_components/system-status-card";
import SettingsLoading from "./loading";

type ServiceStatus = {
  status?: string;
  detail?: string;
};

export default function SettingsPage() {
  const { isSignedIn, isLoaded } = useAuthRedirect();
  const { user } = useUser();
  const { usage, loading: usageLoading } = useUsage();
  const [loading, setLoading] = useState(false);
  const [repoName, setRepoName] = useState<string | null>(null);
  const [indexingStatus, setIndexingStatus] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<
    "online" | "offline" | "degraded" | "maintenance"
  >("online");

  const [uptime, setUptime] = useState<number | null>(null);
  const [services, setServices] = useState<Record<string, ServiceStatus>>({});

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setRepoName(data.stats?.repoName || null);
          setIndexingStatus(data.stats?.indexingStatus || null);
        }
      } catch (error) {
        console.error("error fetchiug repo:", error);
      }
    };

    if (isSignedIn) {
      fetchRepo();
    }
  }, [isSignedIn]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/status");
        const data = await res.json();
        setBackendStatus(data.status || "offline");
        if (data.uptime != null) {
          setUptime(data.uptime);
        }
        if (data.services && typeof data.services === "object") {
          setServices(data.services);
        }
      } catch {
        setBackendStatus("offline");
      }
    };
    fetchStatus();
  }, []);

  const handleUpgrade = () => {
    window.location.href = "/api/polar/checkout";
  };

  const handleManageSubscription = () => {
    window.location.href = "/api/polar/portal";
  };

  if (!isLoaded || usageLoading) {
    return <SettingsLoading />;
  }

  const isPro = usage?.plan === "PRO";
  const currentPlan = usage?.plan || "FREE";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and subscriptio bro
        </p>
      </div>

      <AccountCard
        email={user?.primaryEmailAddress?.emailAddress}
        userId={user?.id}
      />

      <SubscriptionCard
        isPro={isPro}
        onUpgrade={handleUpgrade}
        onManageSubscription={handleManageSubscription}
        loading={loading}
      />

      <UsageCard
        prsUsed={usage?.prsUsed ||0}
        prsCreated={usage?.prsCreated ||0}
        issuesUsed={usage?.issuesUsed ||0}
        chatMessagesUsed={usage?.chatMessagesUsed ||0}
        limits={{
          prs: usage?.limits[currentPlan].prs ||0,
            prsCreated:usage?.limits[currentPlan].prsCreated ||0,
              issues: usage?.limits[currentPlan].issues ||0,
        chat: usage?.limits[currentPlan].chat ||0}
        }}
      />

      <GithubCard repoName={repoName} indexingStatus={indexingStatus} />
      <SystemStatusCard
        backendStatus={backendStatus}
        uptime={uptime}
        services={services}
      />
    </div>
  );
}
