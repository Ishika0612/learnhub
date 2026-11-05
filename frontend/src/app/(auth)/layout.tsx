
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        bgcolor: "background.default",
      }}
    >
      <AuthBrandPanel />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 5 },
          minWidth: 0,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 440 }}>
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              fontSize: 22,
              fontWeight: 750,
              color: "primary.main",
              mb: 5,
            }}
          >
            LearnHub
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
