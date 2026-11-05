
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import InstructorSidebar from "./InstructorSidebar";
import WorkspaceHeader from "@/components/auth/WorkspaceHeader";
import { ApiRequestError, apiRequest, getAccessToken, type ApiUser } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";
import theme from "@/theme";

export default function InstructorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyUser() {
      if (!getAccessToken()) {
        router.replace("/login");
        return;
      }

      try {
        const user = await apiRequest<ApiUser>("/auth/me");

        if (!active) return;

        if (user.role !== "instructor") {
          router.replace(
            user.role === "admin" ? "/admin" : "/student"
          );
          return;
        }

        setChecking(false);
      } catch (cause) {
        if (!active) return;

        if (cause instanceof ApiRequestError && cause.status === 401) {
          clearAccessToken();
          router.replace("/login");
          return;
        }

        setError(
          cause instanceof Error
            ? cause.message
            : "Could not verify instructor access.",
        );
        setChecking(false);
      }
    }

    void verifyUser();

    return () => {
      active = false;
    };
  }, [router]);

  if (checking) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={30} />
        <Typography color="text.secondary" variant="body2">
          Loading instructor workspace...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 680, mx: "auto", p: 3 }}>
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
      <InstructorSidebar />
      <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <WorkspaceHeader role="Instructor" />
          {children}
        </Box>
      </Box>
    </Box>
  );
}
