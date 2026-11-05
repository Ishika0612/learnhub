"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import { ApiRequestError, apiRequest, getAccessToken, type ApiUser } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";
import StudentSidebar from "./StudentSidebar";
import WorkspaceHeader from "@/components/auth/WorkspaceHeader";
import theme from "@/theme";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyStudent() {
      try {
        if (!getAccessToken()) {
          router.replace("/login?redirect=%2Fstudent");
          return;
        }

        const user = await apiRequest<ApiUser>("/auth/me");
        if (!active) return;

        if (user.role !== "student") {
          router.replace(
            user.role === "admin" ? "/admin" : "/instructor",
          );
          return;
        }
        setChecking(false);
      } catch (cause) {
        if (!active) return;

        if (cause instanceof ApiRequestError && cause.status === 401) {
          clearAccessToken();
          router.replace("/login?redirect=%2Fstudent");
          return;
        }
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not verify student access.",
        );
        setChecking(false);
      }
    }

    void verifyStudent();
    return () => {
      active = false;
    };
  }, [router]);

  if (checking) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <Box sx={{ display: "grid", justifyItems: "center", gap: 1.5 }}>
          <CircularProgress size={30} />
          <Typography color="text.secondary" variant="body2">
            Loading your student workspace...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: { xs: "block", md: "flex" },
        bgcolor: theme.palette.background.default,
      }}
    >
      <StudentSidebar />
      <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <WorkspaceHeader role="Student" />
          {children}
        </Box>
      </Box>
    </Box>
  );
}
