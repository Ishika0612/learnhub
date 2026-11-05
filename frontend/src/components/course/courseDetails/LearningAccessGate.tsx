"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { apiRequest, getAccessToken, type ApiUser } from "@/lib/api";
import {
  getCourseLessons,
  getMyEnrollments,
  type BackendLesson,
} from "@/lib/courseApi";
import type { Course } from "../../../lib/CoursesData";
import LearningPlayer from "./LearningPlayer";

type LearningAccessGateProps = {
  course: Course;
};

export default function LearningAccessGate({
  course,
}: LearningAccessGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const coursePath = pathname.startsWith("/student/")
    ? `/student/courses/${course.id}`
    : `/courses/${course.id}`;
  const [lessons, setLessons] = useState<BackendLesson[]>([]);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyCourseAccess() {
      try {
        if (!getAccessToken()) {
          router.replace(
            `/login?redirect=${encodeURIComponent(coursePath)}`,
          );
          return;
        }

        const user = await apiRequest<ApiUser>("/auth/me");
        if (user.role !== "student") {
          setError("Only enrolled students can access this course.");
          return;
        }

        const enrollments = await getMyEnrollments();
        const enrolled = enrollments.some(
          (item) => String(item.course_id) === course.id,
        );
        if (!enrolled) {
          router.replace(coursePath);
          return;
        }

        const courseLessons = await getCourseLessons(course.id);
        if (active) setLessons(courseLessons);
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not verify your enrollment.",
          );
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    void verifyCourseAccess();
    return () => {
      active = false;
    };
  }, [course.id, coursePath, router]);

  if (checking) {
    return (
      <Box
        role="status"
        sx={{
          minHeight: "50vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">Checking your enrollment...</Typography>
      </Box>
    );
  }

  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  const courseWithLessons: Course = {
    ...course,
    lectures: lessons.length,
    curriculum:
      lessons.length > 0
        ? [
            {
              title: "Course lessons",
              lessons: lessons.map((lesson) => lesson.title),
            },
          ]
        : [],
  };

  return <LearningPlayer course={courseWithLessons} backendLessons={lessons} />;
}
