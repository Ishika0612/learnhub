
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  TextField,
  Typography,
  IconButton,
  useTheme,
} from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { authenticate } from "@/lib/auth";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isRegister = mode === "register";
  const registered = !isRegister && searchParams.get("registered") === "true";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = isRegister
        ? {
            full_name: name.trim(),
            email: email.trim(),
            password,
          }
        : {
            email: email.trim(),
            password,
          };

      const data = await authenticate(mode, payload, remember);

      if (isRegister) {
        router.push("/login?registered=true");
        return;
      }

      // Keep the access token in memory using the API helper.
      // The backend should validate the session on protected routes.
      const userRole = "user" in data ? data.user.role : undefined;
      const returnTo = searchParams.get("redirect");
      const safeReturnTo =
        returnTo?.startsWith("/") && !returnTo.startsWith("//")
          ? returnTo
          : null;

      if (userRole === "instructor") {
        router.push(
          safeReturnTo?.startsWith("/instructor")
            ? safeReturnTo
            : "/instructor",
        );
      } else if (safeReturnTo) {
        router.push(safeReturnTo);
      } else if (userRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/student");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to continue. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 420, mx: "auto" }}>
      <Typography
        component="h2"
        sx={{
          fontSize: 30,
          fontWeight: 750,
          letterSpacing: -0.8,
          color: theme.palette.text.primary,
          mb: 1,
        }}
      >
        {isRegister ? "Create your account" : "Welcome back"}
      </Typography>

      <Typography sx={{ color: theme.palette.text.secondary, fontSize: 14, mb: 3.5 }}>
        {isRegister
          ? "Join LearnHub and start learning today."
          : "Sign in to continue your learning journey."}
      </Typography>

      {isRegister && (
        <Alert severity="info" sx={{ mb: 2 }}>
          New accounts are registered as students. Instructor access must be
          granted separately.
        </Alert>
      )}

      {registered && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
          Your account was created successfully. Sign in to continue.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {isRegister && (
          <TextField
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            fullWidth
            margin="normal"
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
        )}

        <TextField
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          fullWidth
          margin="normal"
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          fullWidth
          margin="normal"
          helperText={
            isRegister ? "Use at least 8 characters." : undefined
          }
          slotProps={{
            htmlInput: { minLength: 8 },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((value) => !value)}
                    edge="end"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {!isRegister && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 1,
              mb: 2.5,
              flexWrap: "wrap",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
              }
              label={
                <Typography sx={{ fontSize: 12, color: theme.palette.common.black }}>
                  Remember me
                </Typography>
              }
            />

            <Link
              href="/forgot-password"
              style={{
                fontSize: 12,
                color: theme.palette.primary.main,
                textDecoration: "none",
              }}
            >
              Forgot password?
            </Link>
          </Box>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            mt: isRegister ? 3 : 1,
            py: 1.4,
            bgcolor: theme.palette.primary.main,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 650,
            boxShadow: "none",
            "&:hover": {
              bgcolor: theme.palette.primary.light,
              boxShadow: "none",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : isRegister ? (
            "Create account"
          ) : (
            "Sign in"
          )}
        </Button>

        <Typography
          sx={{
            textAlign: "center",
            mt: 3,
            color: theme.palette.text.secondary,
            fontSize: 13,
          }}
        >
          {isRegister
            ? "Already have an account? "
            : "New to LearnHub? "}
          <Link
            href={isRegister ? "/login" : "/register"}
            style={{
              color: theme.palette.primary.main,
              fontWeight: 650,
              textDecoration: "none",
            }}
          >
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            mt: 3,
            fontSize: 11,
            lineHeight: 1.8,
            color: theme.palette.text.secondary,
          }}
        >
          By continuing, you agree to LearnHub&apos;s Terms of
          Service and Privacy Policy.
        </Typography>
      </Box>
    </Box>
  );
}
