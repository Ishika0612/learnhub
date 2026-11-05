
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { ArrowLeft, MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordForm() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await requestPasswordReset(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 420, mx: "auto" }}>
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 2,
          backgroundColor: theme.palette.secondary.light,
          color: theme.palette.primary.main,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <MailCheck size={26} />
      </Box>

      <Typography
        variant="h4"
        sx={{ fontWeight: 700, fontSize: 30, mb: 1 }}
      >
        Get a password reset link
      </Typography>

      <Typography
        sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.7, mb: 3 }}
      >
        Step 1 of 2: Enter your account email and we&apos;ll send
        you a link. Open that link to choose a new password.
      </Typography>

      {success ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          If an account matches that email, we&apos;ll send a reset link.
          Check your inbox and spam folder, then open the link to set a
          new password.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            required
            type="email"
            label="Email address"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            sx={{ mb: 2.5 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !email.trim()}
            sx={{
              minHeight: 46,
              backgroundColor: theme.palette.primary.main,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
                boxShadow: "none",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Email me a reset link"
            )}
          </Button>
        </Box>
      )}

      {success && (
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            setSuccess(false);
            setError("");
          }}
          sx={{ mt: 1, textTransform: "none" }}
        >
          Use a different email
        </Button>
      )}

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Button
          component="a"
          href="/login"
          startIcon={<ArrowLeft size={17} />}
          sx={{
            color: theme.palette.primary.main,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Back to sign in
        </Button>
      </Box>
    </Box>
  );
}
