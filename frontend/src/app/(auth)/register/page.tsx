
import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import AuthForm from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      }
    >
      <AuthForm mode="register" />
    </Suspense>
  );
}
