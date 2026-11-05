
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { authenticate } from "@/lib/auth";

export default function InstructorLoginForm() {
  const router = useRouter();
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authenticate(
        "login",
        {
          email: email.trim(),
          password,
        },
        remember,
      );

      const role =
        "user" in data ? data.user?.role : undefined;

      if (role !== "instructor") {
        setError(
          "This account does not have instructor access. Please use an instructor account or contact the LearnHub administrator.",
        );
        return;
      }

      router.replace("/instructor");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
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
          maxWidth: 440,
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
              color: "#fff",
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
            Instructor Sign In
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: 14,
              color: theme.palette.text.secondary,
            }}
          >
            Sign in to manage your courses and teach on LearnHub.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
        >
          <TextField
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            fullWidth
            margin="normal"
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="current-password"
            required
            fullWidth
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      edge="end"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              mt: 1,
              mb: 2.5,
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 13,
                color: theme.palette.text.secondary,
              }}
            >
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) =>
                  setRemember(event.target.checked)
                }
              />
              Remember me
            </label>

            <Link
              href="/forgot-password"
              style={{
                fontSize: 13,
                color: theme.palette.primary.main,
                textDecoration: "none",
              }}
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !email.trim() || !password}
            sx={{
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
              "Sign in as instructor"
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
          Want to learn instead?{" "}
          <Link
            href="/login"
            style={{
              color: theme.palette.primary.main,
              fontWeight: 650,
              textDecoration: "none",
            }}
          >
            Student sign in
          </Link>
        </Typography>

        <Typography
          sx={{
            mt: 2,
            textAlign: "center",
            fontSize: 12,
            color: theme.palette.text.secondary,
          }}
        >
          New to teaching on LearnHub?{" "}
          <Link
            href="/instructor/register"
            style={{
              color: theme.palette.primary.main,
              fontWeight: 650,
              textDecoration: "none",
            }}
          >
            Apply to teach
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
