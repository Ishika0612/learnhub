"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  RefreshCw,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { BackendCourse } from "@/lib/courseApi";
import {
  getInstructorApplications,
  type InstructorApplication,
} from "@/lib/admin";
import AdminStats from "@/components/admin/AdminStats";

export default function AdminOverviewPage() {
  const [applications, setApplications] = useState<InstructorApplication[]>([]);
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      getInstructorApplications(),
      apiRequest<BackendCourse[]>("/admin/courses"),
    ]);

    const errors: string[] = [];

    if (results[0].status === "fulfilled") {
      setApplications(results[0].value);
    } else {
      errors.push("Could not load instructor applications.");
    }

    if (results[1].status === "fulfilled") {
      setCourses(results[1].value);
    } else {
      errors.push("Could not load pending courses.");
    }

    setError(errors.join(" "));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const overviewCards = [
    {
      label: "Pending instructor applications",
      value: loading ? "—" : applications.length,
      icon: GraduationCap,
      href: "/admin/applications",
      description: "Review instructor requests",
    },
    {
      label: "Courses awaiting review",
      value: loading ? "—" : courses.length,
      icon: BookOpen,
      href: "/admin/courses",
      description: "Review course submissions",
    },
  ];

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{ fontSize: { xs: 25, md: 30 }, fontWeight: 850, color: "#172b4d" }}
          >
            Admin overview
          </Typography>
          <Typography sx={{ color: "#758195", mt: 0.75, fontSize: 14 }}>
            Manage applications, courses, and platform activity.
          </Typography>
        </Box>

        <Button
          onClick={() => void refresh()}
          disabled={loading}
          startIcon={<RefreshCw size={16} />}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderColor: "#d7deea",
            color: "#344563",
            bgcolor: "#fff",
          }}
        >
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <AdminStats pendingCount={applications.length} loading={loading} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {overviewCards.map(({ label, value, icon: Icon, href, description }) => (
          <Card
            key={label}
            variant="outlined"
            sx={{
              borderColor: "#e2e8f0",
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.025)",
            }}
          >
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography sx={{ color: "#667085", fontSize: 13 }}>
                    {label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 32,
                      fontWeight: 850,
                      color: "#172b4d",
                      mt: 1,
                    }}
                  >
                    {value}
                  </Typography>
                  <Typography sx={{ color: "#8a94a6", fontSize: 12, mt: 0.5 }}>
                    {description}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: "#edf3ff",
                    color: "#173b73",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon size={21} />
                </Box>
              </Box>

              <Button
                component="a"
                href={href}
                endIcon={<ArrowRight size={16} />}
                sx={{
                  mt: 2,
                  p: 0,
                  textTransform: "none",
                  fontWeight: 750,
                  color: "#173b73",
                }}
              >
                Open section
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#e2e8f0" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography component="h2" sx={{ fontSize: 17, fontWeight: 800 }}>
            Quick actions
          </Typography>
          <Typography sx={{ color: "#758195", fontSize: 13, mt: 0.5, mb: 2 }}>
            Go directly to the items that need your attention.
          </Typography>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              component="a"
              href="/admin/applications"
              variant="contained"
              sx={{
                textTransform: "none",
                bgcolor: "#001F54",
                "&:hover": { bgcolor: "#12366b" },
              }}
            >
              Review instructors
            </Button>
            <Button
              component="a"
              href="/admin/courses"
              variant="outlined"
              sx={{ textTransform: "none" }}
            >
              Review courses
            </Button>
            <Button
              component="a"
              href="/admin/users"
              variant="outlined"
              sx={{ textTransform: "none" }}
            >
              View users
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}