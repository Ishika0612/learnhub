
import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      }
    >
      <AuthForm mode="login" />
    </Suspense>
  );
}
