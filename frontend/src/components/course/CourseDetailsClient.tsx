"use client";

import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import CourseOverview from "@/components/course/courseDetails/CourseOverview";
import type { Course } from "@/lib/CoursesData";
import { getApprovedCourses, getCourseLessons } from "@/lib/courseApi";
import { getCourseRating } from "@/lib/ReviewsApi";

export default function CourseDetailsClient({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadCourse() {
      try {
        const items = await getApprovedCourses();
        if (!active) return;
        const foundCourse = items.find((item) => item.id === courseId);
        if (!foundCourse) {
          setCourse(null);
          return;
        }

        const [lessons, rating] = await Promise.all([
          getCourseLessons(courseId),
          getCourseRating(Number(courseId)),
        ]);
        if (!active) return;

        setCourse({
          ...foundCourse,
          lectures: lessons.length,
          ...(rating.total_reviews > 0
            ? {
                rating: rating.average_rating,
                reviews: rating.total_reviews,
              }
            : {}),
          curriculum: lessons.length
            ? [
                {
                  title: "Course lessons",
                  lessons: lessons.map((lesson) => lesson.title),
                },
              ]
            : [],
        });
      } catch (cause: unknown) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load this course.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCourse();

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
  return <CourseOverview course={course} />;
}
