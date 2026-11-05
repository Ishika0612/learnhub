"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import { RefreshCw } from "lucide-react";
import InstructorApplicationsTable from "@/components/admin/InstructorApplicationsTable";
import ApplicationDecisionDialog from "@/components/admin/ApplicationDecisionDialog";
import {
  decideInstructorApplication,
  getInstructorApplications,
  type InstructorApplication,
} from "@/lib/admin";

export default function InstructorApplicationsPage() {
  const [applications, setApplications] = useState<InstructorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<InstructorApplication | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getInstructorApplications();
      setApplications(data);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load instructor applications.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function confirmDecision(reason: string) {
    if (!selected || saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await decideInstructorApplication(selected.id, decision, reason);

      setApplications((current) =>
        current.filter((application) => application.id !== selected.id),
      );

      setNotice(
        decision === "approved"
          ? "Instructor application approved successfully."
          : "Instructor application rejected successfully.",
      );
      setSelected(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not update this application.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 850, color: "#172b4d" }}
          >
            Instructor applications
          </Typography>
          <Typography sx={{ color: "#758195", mt: 0.75, fontSize: 14 }}>
            Review applications before granting instructor access.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshCw size={16} />}
          onClick={() => void refresh()}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {notice && <Alert severity="success">{notice}</Alert>}

      <InstructorApplicationsTable
        applications={applications}
        loading={loading}
        error=""
        saving={saving}
        onApprove={(application) => {
          setDecision("approved");
          setSelected(application);
        }}
        onReject={(application) => {
          setDecision("rejected");
          setSelected(application);
        }}
      />

      <ApplicationDecisionDialog
        application={selected}
        decision={decision}
        saving={saving}
        onClose={() => {
          if (!saving) setSelected(null);
        }}
        onConfirm={(reason) => void confirmDecision(reason)}
      />
    </Box>
  );
}