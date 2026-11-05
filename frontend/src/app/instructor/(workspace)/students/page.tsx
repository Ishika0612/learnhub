"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import { ArrowRight, BookOpen, RefreshCw, Users } from "lucide-react";
import {
  getInstructorDashboard,
  type InstructorDashboardData,
} from "@/lib/DashboardApi";
import theme from "@/theme";

export default function InstructorStudentsPage() {
  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(() => getInstructorDashboard(), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await loadData());
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load student enrollment data.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  useEffect(() => {
    let active = true;
    loadData()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load student enrollment data.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadData]);

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
            Student overview
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Track enrollments and average completion across your courses.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshCw size={16} />}
          onClick={() => void refresh()}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refresh()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading && !data ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : data ? (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            {[
              { label: "Total enrollments", value: data.total_enrollments, icon: Users },
              { label: "Courses taught", value: data.total_courses, icon: BookOpen },
              {
                label: "Average completion",
                value: `${Math.round(data.average_progress)}%`,
                icon: ArrowRight,
              },
            ].map(({ label, value, icon: Icon }) => (
              <Card
                key={label}
                variant="outlined"
                sx={{
                  borderColor: theme.palette.divider,
                  borderRadius: 3,
                  transition: "transform 160ms ease, box-shadow 160ms ease",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(15, 23, 42, .07)" },
                }}
              >
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: theme.palette.accent.light, color: theme.palette.primary.main }}>
                    <Icon size={20} />
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2">{label}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{loading ? "…" : value}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Card variant="outlined" sx={{ borderColor: theme.palette.divider, borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography component="h2" variant="h6" sx={{ fontWeight: 800 }}>
                Average learner progress
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                Based on {data.total_enrollments} enrollment{data.total_enrollments === 1 ? "" : "s"} across your courses.
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, data.average_progress))}
                sx={{ mt: 2.5, height: 9, borderRadius: 5 }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 1 }}>
                <Typography variant="caption" color="text.secondary">Course completion</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  {Math.round(data.average_progress)}%
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/instructor/courses"
                endIcon={<ArrowRight size={16} />}
                sx={{ mt: 2, textTransform: "none" }}
              >
                Review your courses
              </Button>
            </CardContent>
          </Card>

          <Alert severity="info">
            Individual learner names and per-student course activity are not currently exposed by the reporting API. This view shows verified aggregate enrollment and progress data only.
          </Alert>
        </>
      ) : null}
    </Box>
  );
}
