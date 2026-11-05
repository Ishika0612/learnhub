"use client";

import { useEffect, useState } from "react";
import { Avatar, Box, Typography } from "@mui/material";
import LogoutButton from "@/components/auth/LogoutButton";
import { apiRequest, getAccessToken, type ApiUser } from "@/lib/api";
import theme from "@/theme";

export default function WorkspaceHeader({ role }: { role: string }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [profileError, setProfileError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!getAccessToken()) return;

    apiRequest<ApiUser>("/auth/me")
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setProfileError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
        p: { xs: 1.5, sm: 2 },
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        {user && (
          <Avatar
            src={user.profile_picture_url ?? undefined}
            alt={user.full_name}
            sx={{ width: 40, height: 40, flexShrink: 0 }}
          >
            {user.full_name.charAt(0).toUpperCase()}
          </Avatar>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: theme.palette.text.primary,
              fontSize: { xs: 14, sm: 15 },
              fontWeight: 800,
              lineHeight: 1.3,
            }}
          >
            {user?.full_name ?? `${role} workspace`}
          </Typography>
          <Typography
            sx={{
              color: theme.palette.text.secondary,
              fontSize: 12,
              mt: 0.25,
              display: { xs: "none", sm: "block" },
            }}
          >
            {user
              ? `${role} workspace`
              : profileError
                ? "Could not load your profile"
                : "Your LearnHub account"}
          </Typography>
        </Box>
      </Box>
      <LogoutButton
        sx={{
          flexShrink: 0,
          color: theme.palette.error.main,
          borderColor: theme.palette.error.main,
          bgcolor: theme.palette.background.paper,
          "&:hover": {
            color: theme.palette.error.dark,
            borderColor: theme.palette.error.dark,
            bgcolor: theme.palette.error.light,
          },
        }}
      />
    </Box>
  );
}
