"use client";

import { useEffect, useState } from "react";
import { Avatar, Box, Container, Typography } from "@mui/material";
import { BookOpen, GraduationCap } from "lucide-react";
import theme from "@/theme";
import { getApprovedCourses } from "@/lib/courseApi";
import type { Course } from "@/lib/CoursesData";

type InstructorCourses = {
  name: string;
  image: string | null;
  courses: Course[];
};

export default function InstructorsSection() {
  const [instructors, setInstructors] = useState<InstructorCourses[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getApprovedCourses()
      .then((courses) => {
        if (!active) return;
        const grouped = new Map<string, Course[]>();
        courses.forEach((course) => {
          grouped.set(course.instructor, [...(grouped.get(course.instructor) ?? []), course]);
        });
        setInstructors(
          [...grouped.entries()].map(([name, instructorCourses]) => ({
            name,
            image: instructorCourses[0]?.instructorImage ?? null,
            courses: instructorCourses,
          })),
        );
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Could not load instructors.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!instructors.length && !error) return null;

  return (
    <Box
      id="instructors"
      component="section"
      sx={{ py: { xs: 8, md: 11 }, bgcolor: theme.palette.background.default }}
    >
      <Container maxWidth="lg">
        <Typography
          component="h2"
          sx={{
            color: theme.palette.primary.main,
            fontSize: { xs: "1.9rem", md: "2.6rem" },
            fontWeight: 800,
            mb: 1,
          }}
        >
          Meet our instructors
        </Typography>
        <Typography sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          Instructors are shown with their published courses.
        </Typography>
        {error ? (
          <Typography role="alert" sx={{ color: theme.palette.error.main }}>
            {error}
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
              gap: 2.5,
            }}
          >
            {instructors.map((instructor) => (
              <Box
                key={instructor.name}
                sx={{
                  p: 2.5,
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <Avatar
                    src={instructor.image ?? undefined}
                    alt={instructor.name}
                    sx={{ bgcolor: theme.palette.primary.light }}
                  >
                    <GraduationCap color={theme.palette.primary.main} />
                  </Avatar>
                  <Typography component="h3" sx={{ fontWeight: 800 }}>
                    {instructor.name}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <BookOpen size={16} color={theme.palette.text.secondary} />
                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: 13 }}>
                    {instructor.courses.length} published{" "}
                    {instructor.courses.length === 1 ? "course" : "courses"}
                  </Typography>
                </Box>
                {instructor.courses.map((course) => (
                  <Typography
                    key={course.id}
                    component="a"
                    href={`/courses/${course.id}`}
                    sx={{
                      display: "block",
                      mt: 1,
                      color: theme.palette.primary.main,
                      fontSize: 13,
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {course.title}
                  </Typography>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
