import React, { useEffect, useState } from "react";
import { EmailLeadsTable } from "./EmailLeadsTable";
import api from "@/axiosInstance";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import CsvUploader from "./CsvUploader";
import { toast } from "sonner";

interface LeadEmail {
  _id: string;
  email: string;
  provider: "Google" | "Microsoft" | "Other";
  securityGateway: string;
  status: "Not yet contacted" | "Contacted" | "Bounced" | "Replied";
}

export const CampaignLeads = ({
  campaignId,
  campaignName,
}: {
  campaignId: string;
  campaignName: string;
}) => {
  const [leadsData, setLeadsData] = useState<LeadEmail[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetData = async () => {
    try {
      const response = await api.get("/leads");
      if (response.data.success) {
        setLeadsData(response.data.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    handleGetData();
  }, []);

  const isValidEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleAddLead = async () => {
    if (!email.trim()) return toast.error("Please enter an email address.");
    if (!isValidEmail(email)) return toast.error("Invalid email format.");

    setLoading(true);
    try {
      const response = await api.post("/leads", {
        email,
        campaign: campaignId,
        securityGateway: "None",
        status: "Not yet contacted",
      });

      if (response.data.success) {
        toast.success("Lead added successfully!");
        setLeadsData((prev) => [...prev, response.data.data]);
        setShowDialog(false);
        setEmail("");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add lead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 rounded-xl bg-white p-6 shadow-sm">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">
          Leads for <span className="text-primaryColor">{campaignName}</span>
        </h2>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-gradient-primary text-white hover:opacity-90"
          >
            + Add Lead
          </Button>
          <CsvUploader campaignId={campaignId} onSuccess={handleGetData} />
        </div>
      </div>

      {/* Table or Empty State */}
      {leadsData.length > 0 ? (
        <EmailLeadsTable
          onAddLead={() => setShowDialog(true)}
          refetchData={handleGetData}
          data={leadsData}
          campaignId={campaignId}
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <p className="mb-2 text-lg font-medium text-gray-700">
            No leads added yet
          </p>
          <p className="mb-4 text-sm text-gray-500">
            Start by adding leads manually or uploading a CSV file.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-gradient-primary text-white hover:opacity-90"
            >
              + Add Lead
            </Button>
            <CsvUploader campaignId={campaignId} onSuccess={handleGetData} />
          </div>
        </div>
      )}

      {/* Add Lead Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Add New Lead
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Lead Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primaryColor focus:outline-none focus:ring-2 focus:ring-primaryColor"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLead}
              disabled={loading}
              className="rounded-lg bg-gradient-primary text-white hover:opacity-90"
            >
              {loading ? "Adding..." : "Add Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
