"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { ApiRequestError, apiRequest, getAccessToken, type ApiUser } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import WorkspaceHeader from "@/components/auth/WorkspaceHeader";
import theme from "@/theme";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      if (!getAccessToken()) {
        router.replace("/login?redirect=%2Fadmin");
        return;
      }

      try {
        const user = await apiRequest<ApiUser>("/auth/me");

        if (!active) return;

        if (user.role !== "admin") {
          router.replace(
            user.role === "instructor" ? "/instructor" : "/student",
          );
          return;
        }

        setAuthorized(true);
      } catch (cause) {
        if (!active) return;

        if (cause instanceof ApiRequestError && cause.status === 401) {
          clearAccessToken();
          router.replace("/login?redirect=%2Fadmin");
          return;
        }

        setError(
          cause instanceof Error
            ? cause.message
            : "Could not verify administrator access.",
        );
      } finally {
        if (active) setChecking(false);
      }
    }

    void verifyAdmin();

    return () => {
      active = false;
    };
  }, [router]);

  if (checking) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!authorized) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 4 }}>
        <Alert severity="error">
          {error || "Redirecting because this account does not have admin access."}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        display: { xs: "block", md: "flex" },
        alignItems: "flex-start",
      }}
    >
      <AdminSidebar />

      <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <WorkspaceHeader role="Admin" />
          <Box
            component="nav"
            aria-label="Breadcrumb"
            sx={{ mb: 3, display: { xs: "none", sm: "block" } }}
          >
            <Typography
              sx={{ fontSize: 11, color: theme.palette.text.secondary, fontWeight: 750, letterSpacing: 0.6 }}
            >
              LEARNHUB <Box component="span" sx={{ mx: 0.75, color: theme.palette.text.disabled }}>/</Box> ADMINISTRATION
            </Typography>
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
}