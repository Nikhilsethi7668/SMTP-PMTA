import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/axiosInstance";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const CreateCampaignForm: React.FC = () => {
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState<string>("");

  const handleContinue = async () => {
    try {
      const response = await api.post("/campaigns", { name: campaignName });
      if (response.data.success) {
        toast.success(`Campaign Created: ${campaignName}`);
        navigate(
          `/app/campaigns/details?campaignName=${encodeURIComponent(campaignName)}`
        );
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create campaign.");
    }
  };

  const handleCancel = () => {
    setCampaignName("");
    navigate(-1);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <AppHeader onClickAction={() => navigate(-1)} headings="Back" />

      {/* Form container */}
      <div className="mx-auto mt-16 w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg transition-all duration-300">
        {/* Heading */}
        <h1 className="mb-1 text-2xl font-semibold">Let&apos;s create a new campaign</h1>
        <p className="mb-6 text-muted-foreground">What would you like to name it?</p>

        {/* Input */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Campaign Name
          </label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="My Campaign"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="text-sm font-medium text-primary hover:underline"
          >
            Cancel
          </button>
          <Button
            onClick={handleContinue}
            className="rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-white hover:opacity-90"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
