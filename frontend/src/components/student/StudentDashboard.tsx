"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import { ArrowRight, BookOpen, CheckCircle2, Compass, PlayCircle } from "lucide-react";
import { ApiRequestError, apiRequest, type ApiUser } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";

type StudentCourse = {
  course_id: number;
  title: string;
  subtitle: string | null;
  category: string;
  level: string;
  thumbnail_url: string | null;
  instructor_id: number;
  instructor_name: string | null;
  instructor_profile_picture_url: string | null;
  progress: number;
};

type StudentDashboardData = {
  total_enrollments: number;
  completed_courses: number;
  in_progress_courses: number;
  average_progress: number;
  courses: StudentCourse[];
};

export default function StudentDashboard() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [dashboard, setDashboard] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    return Promise.all([
      apiRequest<ApiUser>("/auth/me"),
      apiRequest<StudentDashboardData>("/dashboard/student", {
        cache: "no-store",
      }),
    ]);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [currentUser, data] = await loadDashboard();
      setUser(currentUser);
      setDashboard(data);
    } catch (cause) {
      if (cause instanceof ApiRequestError && cause.status === 401) {
        clearAccessToken();
      }
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load your student dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadDashboard]);

  useEffect(() => {
    let active = true;
    loadDashboard()
      .then(([currentUser, data]) => {
        if (!active) return;
        setUser(currentUser);
        setDashboard(data);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if (cause instanceof ApiRequestError && cause.status === 401) {
          clearAccessToken();
        }
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load your student dashboard.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  if (loading) {
    return (
      <Box sx={{ minHeight: 300, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !dashboard || !user) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refresh()}>
              Retry
            </Button>
          }
        >
          {error || "Student dashboard is unavailable."}
        </Alert>
      </Box>
    );
  }

  const stats = [
    { label: "Enrolled courses", value: dashboard.total_enrollments, icon: BookOpen, href: "/student/my-learning" },
    { label: "In progress", value: dashboard.in_progress_courses, icon: PlayCircle, href: "/student/my-learning" },
    { label: "Completed", value: dashboard.completed_courses, icon: CheckCircle2, href: "/student/my-learning" },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", display: "grid", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={user.profile_picture_url ?? undefined}
            alt={user.full_name}
            sx={{ width: 52, height: 52 }}
          >
            {user.full_name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 800, color: "#172b4d" }}>
              Welcome back, {user.full_name}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Keep learning at your own pace. Here’s your progress.
            </Typography>
          </Box>
        </Box>
        <Button
          component={Link}
          href="/student/courses"
          variant="contained"
          startIcon={<Compass size={17} />}
          sx={{ textTransform: "none", bgcolor: "#001F54" }}
        >
          Explore courses
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Card
            key={label}
            component={Link}
            href={href}
            variant="outlined"
            sx={{
              borderColor: "#e2e8f0",
              borderRadius: 3,
              color: "inherit",
              textDecoration: "none",
              transition: "transform 160ms ease, box-shadow 160ms ease",
              "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(15, 23, 42, .08)" },
              "&:focus-visible": { outline: "2px solid #2563EB", outlineOffset: 2 },
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#edf3ff", color: "#173b73" }}>
                <Icon size={21} />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2">{label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{value}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card variant="outlined" sx={{ borderColor: "#e2e8f0", borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2 }}>
            <Box>
              <Typography component="h2" variant="h6" sx={{ fontWeight: 800 }}>
                Continue learning
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Overall progress: {Math.round(dashboard.average_progress)}%
              </Typography>
            </Box>
            <Button component={Link} href="/student/my-learning" endIcon={<ArrowRight size={16} />} sx={{ textTransform: "none" }}>
              My Learning
            </Button>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, dashboard.average_progress))}
            sx={{ height: 8, borderRadius: 5, mb: 3 }}
          />

          {dashboard.courses.length === 0 ? (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <BookOpen size={30} color="#98a2b3" />
              <Typography sx={{ mt: 1, fontWeight: 700 }}>
                You haven’t enrolled in any courses yet.
              </Typography>
              <Button component={Link} href="/student/courses" sx={{ mt: 1, textTransform: "none" }}>
                Browse the catalog
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2,
              }}
            >
              {[...dashboard.courses]
                .sort((a, b) => {
                  if (a.progress === 100) return 1;
                  if (b.progress === 100) return -1;
                  return a.progress - b.progress;
                })
                .slice(0, 4)
                .map((course) => (
                <Card key={course.course_id} variant="outlined" sx={{ display: "flex", minWidth: 0, borderColor: "#e2e8f0" }}>
                  {course.thumbnail_url ? (
                    <CardMedia
                      component="img"
                      image={course.thumbnail_url}
                      alt=""
                      sx={{ width: 120, display: { xs: "none", sm: "block" }, objectFit: "cover" }}
                    />
                  ) : null}
                  <CardContent sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      {course.category} · {course.level}
                    </Typography>
                    <Typography sx={{ fontWeight: 750, mt: 0.5 }} noWrap>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {course.progress}% complete
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, Math.max(0, course.progress))}
                      sx={{ mt: 1, mb: 1.5, height: 6, borderRadius: 4 }}
                    />
                    <Button component={Link} href={`/student/learn/${course.course_id}`} size="small" endIcon={<ArrowRight size={15} />} sx={{ textTransform: "none" }}>
                      Continue
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
