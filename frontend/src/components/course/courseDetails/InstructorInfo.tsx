"use client";

import { Avatar, Box, Typography } from "@mui/material";
import { BookOpen, GraduationCap } from "lucide-react";
import theme from "@/theme";
import type { Course } from "../../../lib/CoursesData";

type InstructorInfoProps = {
  course: Course;
};

export default function InstructorInfo({ course }: InstructorInfoProps) {
  return (
    <Box
      component="section"
      sx={{
        mt: 3,
        p: { xs: 2.5, md: 3 },
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
      }}
    >
      <Typography
        component="h2"
        sx={{ mb: 2, color: theme.palette.primary.main, fontSize: 22, fontWeight: 800 }}
      >
        Course instructor
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          src={course.instructorImage ?? undefined}
          alt={course.instructor}
          sx={{ width: 52, height: 52, bgcolor: theme.palette.primary.light }}
        >
          <GraduationCap />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 800 }}>{course.instructor}</Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: 13 }}>
            Instructor for {course.category}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
        <BookOpen size={16} color={theme.palette.text.secondary} />
        <Typography sx={{ color: theme.palette.text.secondary, fontSize: 13 }}>
          {course.title}
        </Typography>
      </Box>
    </Box>
  );
}
