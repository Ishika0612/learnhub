"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import { CheckCircle2, GraduationCap, ShieldCheck } from "lucide-react";
import { apiRequest, getAccessToken, type ApiUser } from "@/lib/api";
import { enrollInCourse, getMyEnrollments } from "@/lib/courseApi";
import { formatPrice, type Course } from "../../../lib/CoursesData";
import theme from "@/theme";

type EnrollmentDialogProps = {
  course: Course;
};

export default function EnrollmentDialog({
  course,
}: EnrollmentDialogProps) {
  const router = useRouter();
  const isStudentWorkspace = usePathname().startsWith("/student/");
  const learningPath = isStudentWorkspace ? "/student/learn" : "/learn";
  const [session, setSession] = useState<ApiUser | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        if (!getAccessToken()) {
          if (active) {
            setSession(null);
            setEnrolled(false);
          }
          return;
        }

        const currentUser = await apiRequest<ApiUser>("/auth/me");
        const enrollments =
          currentUser.role === "student" ? await getMyEnrollments() : [];
        if (active) {
          setSession(currentUser);
          setEnrolled(
            enrollments.some(
              (enrollment) => String(enrollment.course_id) === course.id,
            ),
          );
        }
      } catch {
        if (active) {
          setSession(null);
          setEnrolled(false);
        }
      } finally {
        if (active) setSessionReady(true);
      }
    }

    void loadSession();
    return () => {
      active = false;
    };
  }, [course.id]);

  function handleEnrollClick() {
    if (!sessionReady) return;

    if (!session || session.role !== "student") {
      const returnTo = `/courses/${course.id}`;
      router.push(`/login?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (enrolled) {
      router.push(`${learningPath}/${course.id}`);
      return;
    }

    setError("");
    setOpen(true);
  }

  async function handleConfirmEnrollment() {
    setEnrolling(true);
    setError("");
    try {
      await enrollInCourse(course.id);
      setEnrolled(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not enroll in this course.",
      );
    } finally {
      setEnrolling(false);
    }
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Button
        fullWidth
        variant="contained"
        onClick={handleEnrollClick}
        disabled={!sessionReady}
        sx={{
          mt: 1,
          py: 1.4,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 800,
          bgcolor: theme.palette.primary.main,
          "&:hover": { bgcolor: theme.palette.primary.light },
        }}
      >
        {!sessionReady
          ? "Checking student session..."
          : enrolled
            ? "Go to course"
            : session
              ? "Enroll now"
              : "Log in to enroll"}
      </Button>

      <Dialog
  open={open}
  onClose={handleClose}
  fullWidth
  maxWidth="sm"
  sx={{
    "& .MuiDialog-paper": {
      borderRadius: 3,
    },
  }}
>
        {!enrolled ? (
          <>
            <DialogTitle sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
              Confirm your enrollment
            </DialogTitle>

            <DialogContent>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                {session?.role === "student"
                  ? `You are enrolling as ${session.email}. Review the course before continuing.`
                  : "Sign in with a student account to enroll."}
              </Typography>

              <Box
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.default,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: theme.palette.text.primary }}
                >
                  {course.title}
                </Typography>

                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                  Instructor: {course.instructor}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Course price
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: theme.palette.primary.main }}
                  >
                    {formatPrice(course.price)}
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                Enrollment will be saved to your LearnHub account.
              </Alert>
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
              <Button
                onClick={handleClose}
                sx={{ textTransform: "none", color: theme.palette.text.secondary }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                startIcon={<GraduationCap size={17} />}
                onClick={handleConfirmEnrollment}
                disabled={!session || session.role !== "student" || enrolling}
                sx={{
                  textTransform: "none",
                  bgcolor: theme.palette.primary.main,
                  fontWeight: 700,
                  "&:hover": { bgcolor: theme.palette.primary.light },
                }}
              >
                {enrolling ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Enroll as student"
                )}
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogContent sx={{ textAlign: "center", py: 5 }}>
              <CheckCircle2
                size={56}
                color={theme.palette.success.main}
                style={{ margin: "0 auto 16px" }}
              />

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1 }}
              >
                Course added to My Learning
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, lineHeight: 1.8, mb: 2 }}
              >
                {course.title} is now available in your account&apos;s My
                Learning list.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  color: theme.palette.text.secondary,
                }}
              >
                <ShieldCheck size={17} />
                <Typography variant="caption">
                  No payment was processed
                </Typography>
              </Box>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
              <Button
                component="a"
                href={isStudentWorkspace ? "/student/my-learning" : "/my-learning"}
                variant="outlined"
                onClick={handleClose}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                My Learning
              </Button>
              <Button
                component="a"
                href={`${learningPath}/${course.id}`}
                variant="contained"
                onClick={handleClose}
                sx={{
                  textTransform: "none",
                  bgcolor: theme.palette.primary.main,
                  "&:hover": { bgcolor: theme.palette.primary.light },
                }}
              >
                Start course
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}