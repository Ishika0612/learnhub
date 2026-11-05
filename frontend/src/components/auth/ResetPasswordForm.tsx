
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const theme = useTheme();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setApiError("");

    if (!token) {
      setApiError("This password reset link is missing its token.");
      return;
    }

    try {
      await resetPassword(token, values.password);
      setSuccess(true);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to reset your password. Please try again."
      );
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
          display: "grid",
          placeItems: "center",
          mb: 3,
        }}
      >
        <LockKeyhole size={25} />
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Choose a new password
      </Typography>

      <Typography sx={{ color: "text.secondary", mb: 3, fontSize: 14 }}>
        Step 2 of 2: Create a new password for your LearnHub account.
      </Typography>

      {success ? (
        <>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your password has been reset successfully. You can now sign in
            with your new password.
          </Alert>
          <Button
            fullWidth
            variant="contained"
            onClick={() => router.replace("/login")}
            sx={{
              backgroundColor: theme.palette.primary.main,
              textTransform: "none",
              "&:hover": { backgroundColor: theme.palette.primary.light },
            }}
          >
            Back to sign in
          </Button>
        </>
      ) : (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {!token && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This page needs the reset link from your email. Request a new
              link below if you don&apos;t have it.
            </Alert>
          )}

          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <TextField
            {...register("password")}
            fullWidth
            label="New password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            error={!!errors.password}
            helperText={errors.password?.message || "Use at least 8 characters."}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((value) => !value)}
                      edge="end"
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            {...register("confirmPassword")}
            fullWidth
            label="Confirm new password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            disabled={isSubmitting}
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? (
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting || !token}
            sx={{
              minHeight: 46,
              backgroundColor: theme.palette.primary.main,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
                boxShadow: "none",
              },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Save new password"
            )}
          </Button>

          <Typography
            sx={{
              mt: 2,
              textAlign: "center",
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Link missing or expired?{" "}
            <Link href="/forgot-password">Get a new reset link</Link>
          </Typography>
        </Box>
      )}
    </Box>
  );
}
