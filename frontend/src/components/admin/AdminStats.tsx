
"use client";

import { Box, Paper, Typography, useTheme } from "@mui/material";
import { Clock3 } from "lucide-react";

type AdminStatsProps = {
  pendingCount: number;
  loading: boolean;
};

export default function AdminStats({
  pendingCount,
  loading,
}: AdminStatsProps) {
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderColor: theme.palette.divider,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            display: "flex",
            borderRadius: 2,
            bgcolor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText,
          }}
        >
          <Clock3 size={24} />
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Pending applications
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: theme.palette.primary.main }}
          >
            {loading ? "—" : pendingCount}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
