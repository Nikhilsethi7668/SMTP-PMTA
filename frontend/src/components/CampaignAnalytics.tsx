import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface Campaign {
  _id: string;
  name: string;
  status?: "draft" | "running" | "paused" | "completed";
  metrics_sent?: number;
  metrics_delivered?: number;
  metrics_opened?: number;
  metrics_clicked?: number;
  metrics_bounced?: number;
  metrics_complaints?: number;
  updatedAt?: string;
}

interface CampaignAnalyticsProps {
  campaign: Campaign;
  onResume?: (id: string) => void;
  onPause?: (id: string) => void;
}

export const CampaignAnalytics: React.FC<CampaignAnalyticsProps> = ({
  campaign,
  onResume,
  onPause,
}) => {
  const {
    _id,
    status = "draft",
    metrics_sent = 0,
    metrics_delivered = 0,
    metrics_opened = 0,
    metrics_clicked = 0,
    metrics_bounced = 0,
    metrics_complaints = 0,
  } = campaign;

  const sentRate = metrics_sent ? ((metrics_delivered / metrics_sent) * 100).toFixed(1) : "0";
  const openRate = metrics_sent ? ((metrics_opened / metrics_sent) * 100).toFixed(1) : "0";
  const clickRate = metrics_sent ? ((metrics_clicked / metrics_sent) * 100).toFixed(1) : "0";
  const bounceRate = metrics_sent ? ((metrics_bounced / metrics_sent) * 100).toFixed(1) : "0";
  const complaintRate = metrics_sent ? ((metrics_complaints / metrics_sent) * 100).toFixed(1) : "0";

  const isPaused = status === "paused";
  const progressValue =
    status === "completed" ? 100 : metrics_sent ? (metrics_delivered / metrics_sent) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 rounded-xl bg-background p-6 shadow-sm border border-border transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Analytics</h2>

        <div className="flex items-center gap-3">
          {isPaused ? (
            <Button onClick={() => onResume?.(_id)} variant="default">
              ▶ Resume campaign
            </Button>
          ) : (
            <Button onClick={() => onPause?.(_id)} variant="secondary">
              ❚❚ Pause campaign
            </Button>
          )}
        </div>
      </div>

      {/* Status + Progress */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Status:</span>
          <span
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium",
              status === "paused" && "bg-muted text-muted-foreground",
              status === "running" && "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
              status === "draft" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
              status === "completed" && "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        <Progress value={progressValue} className="h-2 w-40" />
        <span className="text-sm font-medium text-foreground">
          {progressValue.toFixed(0)}%
        </span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <MetricCard title="Sent Rate" value={`${sentRate}%`} />
        <MetricCard title="Open Rate" value={`${openRate}%`} />
        <MetricCard title="Click Rate" value={`${clickRate}%`} />
        <MetricCard title="Bounce Rate" value={`${bounceRate}%`} />
        <MetricCard title="Complaint Rate" value={`${complaintRate}%`} />
      </div>

      {/* Placeholder for analytics table */}
      <div className="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">
        No data available for specified time
      </div>
    </div>
  );
};

const MetricCard = ({ title, value }: { title: string; value: string }) => (
  <Card className="border border-border shadow-none bg-card transition-colors duration-300">
    <CardContent className="flex flex-col items-center justify-center p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </CardContent>
  </Card>
);
