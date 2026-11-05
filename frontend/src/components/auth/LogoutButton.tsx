"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, type SxProps, type Theme } from "@mui/material";
import { LogOut } from "lucide-react";
import { clearAccessToken } from "@/lib/auth";

type LogoutButtonProps = {
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
};

export default function LogoutButton({
  fullWidth = false,
  sx,
}: LogoutButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  function logout() {
    setError("");
    try {
      clearAccessToken();
      router.replace("/");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not sign out.",
      );
    }
  }

  return (
    <Box>
      <Button
        onClick={logout}
        fullWidth={fullWidth}
        aria-label="Log out"
        variant="outlined"
        startIcon={<LogOut size={17} />}
        sx={{
          textTransform: "none",
          fontWeight: 700,
          ...sx,
        }}
      >
        Log out
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
