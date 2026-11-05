"use client";

import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import LearningAccessGate from "@/components/course/courseDetails/LearningAccessGate";
import type { Course } from "@/lib/CoursesData";
import { getApprovedCourses } from "@/lib/courseApi";

export default function LearningPageClient({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getApprovedCourses()
      .then((items) => {
        if (active) setCourse(items.find((item) => item.id === courseId) ?? null);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load this course.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [courseId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!course) {
    return (
      <Typography role="status" sx={{ p: 5, textAlign: "center" }}>
        This course is unavailable or has not been approved yet.
      </Typography>
    );
  }
  return <LearningAccessGate course={course} />;
}
