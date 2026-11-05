
"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import type { InstructorApplication } from "@/lib/admin";

type Props = {
  application: InstructorApplication | null;
  decision: "approved" | "rejected";
  saving: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export default function ApplicationDecisionDialog({
  application,
  decision,
  saving,
  onClose,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");

  // The parent changes the dialog target; clear stale rejection text on close.
  const closeDialog = () => {
    setReason("");
    onClose();
  };

  const confirm = () => {
    if (decision === "rejected" && !reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <Dialog
      open={Boolean(application)}
      onClose={() => !saving && closeDialog()}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {decision === "approved"
          ? "Approve instructor application?"
          : "Reject instructor application?"}
      </DialogTitle>

      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {application?.full_name} ({application?.email})
        </Typography>

        {decision === "approved" ? (
          <Typography>
            Confirm the application. Instructor access is granted after the
            approval is saved.
          </Typography>
        ) : (
          <TextField
            autoFocus
            fullWidth
            required
            multiline
            minRows={3}
            label="Reason for rejection"
            placeholder="Explain why this application is being rejected"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 1000 } }}
            helperText={`${reason.length}/1000 characters`}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={closeDialog}
          disabled={saving}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color={decision === "approved" ? "success" : "error"}
          onClick={confirm}
          disabled={saving || (decision === "rejected" && !reason.trim())}
          sx={{ textTransform: "none" }}
        >
          {saving
            ? "Saving..."
            : decision === "approved"
              ? "Confirm approval"
              : "Confirm rejection"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
