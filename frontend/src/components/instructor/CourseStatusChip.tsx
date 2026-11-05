
"use client";

import { Chip } from "@mui/material";

type CourseStatusChipProps = {
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
};

export default function CourseStatusChip({
  status,
}: CourseStatusChipProps) {
  const styles: Record<
    string,
    { label: string; color: "default" | "success" | "warning" | "error" }
  > = {
    PENDING: { label: "Pending Review", color: "warning" },
    APPROVED: { label: "Approved", color: "success" },
    REJECTED: { label: "Rejected", color: "error" },
  };

  const config = styles[status.toUpperCase()] ?? {
    label: status,
    color: "default" as const,
  };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
    />
  );
}
