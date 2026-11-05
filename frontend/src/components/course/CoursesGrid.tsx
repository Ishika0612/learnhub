
"use client";

import { Box } from "@mui/material";
import type { Course } from "../../lib/CoursesData";
import CourseCard from "./CourseCard";

type CoursesGridProps = {
  courses: Course[];
  studentWorkspace?: boolean;
};

export default function CoursesGrid({
  courses,
  studentWorkspace = false,
}: CoursesGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))",
        },
        gap: { xs: 2, md: 2.5 },
        alignItems: "stretch",
      }}
    >
      {courses.map((course, index) => (
        <CourseCard
          key={course.id}
          course={course}
          index={index}
          studentWorkspace={studentWorkspace}
        />
      ))}
    </Box>
  );
}
