
"use client";

import { Box, Button, Typography, useTheme } from "@mui/material";
import { RefreshCw, ShieldCheck } from "lucide-react";

type AdminHeaderProps = {
  onRefresh: () => void;
  loading: boolean;
};

export default function AdminHeader({
  onRefresh,
  loading,
}: AdminHeaderProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShieldCheck
            size={25}
            color={theme.palette.primary.main}
          />
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: theme.palette.primary.main }}
          >
            Admin Dashboard
          </Typography>
        </Box>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Review and manage instructor applications.
        </Typography>
      </Box>

      <Button
        variant="outlined"
        startIcon={<RefreshCw size={17} />}
        onClick={onRefresh}
        disabled={loading}
        sx={{ textTransform: "none" }}
      >
        Refresh
      </Button>
    </Box>
  );
}
