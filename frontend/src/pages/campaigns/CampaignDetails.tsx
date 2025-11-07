import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Tab Components
import { type Campaign, CampaignAnalytics } from "@/components/CampaignAnalytics";
import { CampaignLeads } from "@/components/CampaignLeads";
import { CampaignSequences } from "@/components/CampaignSequences";
import api from "@/axiosInstance";
import ScheduleManager from "@/components/ScheduleManager";
import CampaignSettings from "@/components/CampaignSettings";
import { toast } from "sonner";

export const CampaignDetails = () => {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const [isCampaignPause, setIsCampaignPause] = useState(false);
  const prefilledCampaignName = query.get("campaignName") || "";
  const prefilledCampaignId = query.get("campaignId") || "";

  // --- Tabs ---
  const tabs = [
    { key: "analytics", label: "Analytics" },
    { key: "leads", label: "Leads" },
    { key: "sequences", label: "Sequences" },
    { key: "schedules", label: "Schedules" },
    { key: "options", label: "Options" },
  ];

  const [activeTab, setActiveTab] = useState("analytics");
  const [CampaignDetails, setCampaignDetails] = useState<Campaign>({
    _id: "",
    name: prefilledCampaignName,
    status: "draft",
    metrics_sent: 0,
    metrics_delivered: 0,
    metrics_opened: 0,
    metrics_clicked: 0,
    metrics_bounced: 0,
    metrics_complaints: 0,
    updatedAt: new Date().toISOString(),
  });

  const handleGetAnalyticsData = async (id: string) => {
    try {
      const response = await api.get(`campaigns/${id}`);
      if (response.data.success) {
        setCampaignDetails(response.data.campaign);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch campaign data");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "analytics":
        return (
          <CampaignAnalytics
            campaign={CampaignDetails}
            onPause={() => console.log("pause")}
            onResume={() => console.log("resume")}
          />
        );
      case "leads":
        return (
          <CampaignLeads campaignId={prefilledCampaignId} campaignName={prefilledCampaignName} />
        );
      case "sequences":
        return <CampaignSequences />;
      case "schedules":
        return <ScheduleManager />;
      case "options":
        return <CampaignSettings />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (prefilledCampaignId) handleGetAnalyticsData(prefilledCampaignId);
  }, [prefilledCampaignId]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <AppHeader onClickAction={() => navigate(-1)} headings={prefilledCampaignName} />

      <div className="flex flex-1 flex-col p-6">
        {/* Tabs */}
        <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-2 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Pause/Play Button */}
          <Button
            variant="outline"
            onClick={() => setIsCampaignPause(!isCampaignPause)}
            className="flex items-center gap-2 border-border bg-card text-foreground hover:bg-accent"
          >
            {isCampaignPause ? (
              <>
                <Play className="h-4 w-4" /> Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" /> Pause
              </>
            )}
          </Button>
        </div>

        {/* Tab Content */}
        <div className="flex-1">{renderTabContent()}</div>
      </div>
    </div>
  );
};
