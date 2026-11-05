
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Users,
  XCircle,
  ArrowRight,
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  getInstructorDashboard,
  type InstructorDashboardData,
} from "../../lib/DashboardApi";

import InstructorStatCard from "./InstructorStatCard";
import InstructorProgressCard from "./InstructorProgressCard";

export default function InstructorDashboard() {
  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(() => getInstructorDashboard(), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await loadData());
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load instructor dashboard.",
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
          setError(cause instanceof Error ? cause.message : "Unable to load instructor dashboard.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadData]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <CircularProgress size={28} />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Loading instructor dashboard...
        </Typography>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refresh()}>
              Retry
            </Button>
          }
        >
          {error || "Dashboard data is unavailable."}
        </Alert>
      </Container>
    );
  }

  const stats = [
    {
      title: "Total Courses",
      value: data.total_courses,
      description: "Courses you have created",
      icon: <BookOpen size={22} />,
    },
    {
      title: "Approved Courses",
      value: data.approved_courses,
      description: "Visible in the course catalogue",
      icon: <CheckCircle2 size={22} />,
    },
    {
      title: "Pending Review",
      value: data.pending_courses,
      description: "Waiting for admin approval",
      icon: <Clock3 size={22} />,
    },
    {
      title: "Rejected Courses",
      value: data.rejected_courses,
      description: "Require changes or resubmission",
      icon: <XCircle size={22} />,
    },
    {
      title: "Total Enrollments",
      value: data.total_enrollments,
      description: "Students enrolled in your courses",
      icon: <Users size={22} />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
            Instructor overview
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            A live snapshot of your courses and student progress.
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

      <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", mb: 3 }}>
        <Button
          component={Link}
          href="/instructor/courses/create"
          variant="contained"
          startIcon={<Plus size={16} />}
          sx={{ textTransform: "none" }}
        >
          Create a course
        </Button>
        <Button
          component={Link}
          href="/instructor/courses"
          variant="outlined"
          endIcon={<ArrowRight size={16} />}
          sx={{ textTransform: "none" }}
        >
          Manage courses
        </Button>
        <Button
          component={Link}
          href="/instructor/students"
          variant="outlined"
          startIcon={<Users size={16} />}
          sx={{ textTransform: "none" }}
        >
          Student overview
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        {stats.map((stat) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <InstructorStatCard {...stat} />
          </Grid>
        ))}

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InstructorProgressCard
            averageProgress={data.average_progress}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
