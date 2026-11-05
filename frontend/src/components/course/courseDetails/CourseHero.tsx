
"use client";

import { Box, Chip, Rating, Typography } from "@mui/material";
import { motion } from "motion/react";
import theme from "@/theme";
import { formatStudents, type Course } from "../../../lib/CoursesData";

type Props = {
  course: Course;
};

export default function CourseHero({ course }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          borderRadius: 4,
          p: { xs: 3, md: 4 },
        }}
      >
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={course.category}
            size="small"
            sx={{
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
            }}
          />
          <Chip
            label={course.level}
            size="small"
            sx={{
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
            }}
          />
        </Box>

        <Typography
          variant="h3"
          sx={{
            mt: 3,
            fontWeight: 800,
            fontSize: { xs: 28, md: 40 },
            lineHeight: 1.2,
          }}
        >
          {course.title}
        </Typography>

        <Typography
          sx={{
            mt: 2,
            color: theme.palette.secondary.light,
            lineHeight: 1.8,
          }}
        >
          {course.subtitle}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            mt: 3,
}}
        >
<Typography sx={{ fontWeight: 700 }}>
  {course.instructor}
</Typography>

{course.rating !== undefined && (
  <>
    <Rating value={course.rating} precision={0.1} readOnly size="small" />
    {course.reviews !== undefined && (
      <Typography
        variant="body2"
        sx={{ color: theme.palette.secondary.light }}
      >
        ({formatStudents(course.reviews)} reviews)
      </Typography>
    )}
  </>
)}
        </Box>
      </Box>
    </motion.div>
  );
}
