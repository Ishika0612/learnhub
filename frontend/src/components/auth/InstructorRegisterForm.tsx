
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { GraduationCap } from "lucide-react";
import { apiRequest } from "@/lib/api";

type InstructorRegistrationResponse = {
  id: number;
  email: string;
  role: string;
  instructor_status: string | null;
};

export default function InstructorRegisterForm() {
  const theme = useTheme();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // This must be a dedicated backend endpoint.
      // Do not use the public student registration endpoint.
      const data =
        await apiRequest<InstructorRegistrationResponse>(
          "/auth/instructor/register",
          {
            method: "POST",
            body: JSON.stringify({
              full_name: fullName.trim(),
              email: email.trim(),
              password,
            }),
          },
        );

      // Only show success when the backend confirms the
      // instructor role and pending approval status.
      if (
        data.role !== "instructor" ||
        data.instructor_status !== "pending"
      ) {
        setError(
          "The server did not confirm a pending instructor application. Please contact the LearnHub administrator.",
        );
        return;
      }

      setSuccess(
        "Your instructor application has been submitted. You can sign in after the administrator approves your account.",
      );

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your application. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 5,
        bgcolor: theme.palette.background.default,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 3, sm: 4 },
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              mx: "auto",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.common.white,
            }}
          >
            <GraduationCap size={28} />
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 25, sm: 29 },
              fontWeight: 750,
              letterSpacing: -0.7,
              color: theme.palette.text.primary,
            }}
          >
            Apply to Teach
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: 14,
              lineHeight: 1.7,
              color: theme.palette.text.secondary,
            }}
          >
            Create your instructor application and share
            your knowledge with LearnHub students.
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 2.5 }}>
          New instructor accounts require administrator
          approval before instructor access is granted.
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2.5 }}>
            {success}
            {" "}
            <Link
              href="/instructor/login"
              style={{
                color: theme.palette.primary.main,
                fontWeight: 650,
              }}
            >
              Go to instructor sign in
            </Link>
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
        >
          <TextField
            label="Full name"
            value={fullName}
            onChange={(event) =>
              setFullName(event.target.value)
            }
            autoComplete="name"
            required
            fullWidth
            margin="normal"
            slotProps={{
              htmlInput: { maxLength: 100 },
            }}
          />

          <TextField
            label="Email address"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            autoComplete="email"
            required
            fullWidth
            margin="normal"
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="new-password"
            required
            fullWidth
            margin="normal"
            helperText="Use at least 8 characters."
            slotProps={{
              htmlInput: { minLength: 8 },
            }}
          />

          <TextField
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            autoComplete="new-password"
            required
            fullWidth
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={
              loading ||
              !fullName.trim() ||
              !email.trim() ||
              !password ||
              !confirmPassword
            }
            sx={{
              mt: 2.5,
              py: 1.35,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 650,
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Submit instructor application"
            )}
          </Button>
        </Box>

        <Typography
          sx={{
            mt: 3,
            textAlign: "center",
            fontSize: 13,
            color: theme.palette.text.secondary,
          }}
        >
          Already have an instructor account?{" "}
          <Link
            href="/instructor/login"
            style={{
              color: theme.palette.primary.main,
              fontWeight: 650,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </Typography>

        <Typography
          sx={{
            mt: 1.5,
            textAlign: "center",
            fontSize: 13,
            color: theme.palette.text.secondary,
          }}
        >
          Want to learn instead?{" "}
          <Link
            href="/register"
            style={{
              color: theme.palette.primary.main,
              fontWeight: 650,
              textDecoration: "none",
            }}
          >
            Student registration
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
