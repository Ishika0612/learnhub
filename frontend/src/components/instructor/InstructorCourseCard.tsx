
"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Typography,
} from "@mui/material";
import { Edit3, Users } from "lucide-react";
import theme from "@/theme";

import CourseStatusChip from "./CourseStatusChip";

export type InstructorCourse = {
  id: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  category: string;
  level: string;
  price: number;
  thumbnail_url?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

type InstructorCourseCardProps = {
  course: InstructorCourse;
};

export default function InstructorCourseCard({
  course,
}: InstructorCourseCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderColor: theme.palette.divider,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {course.thumbnail_url ? (
        <CardMedia
          component="img"
          height="170"
          image={course.thumbnail_url}
          alt={course.title}
          sx={{ objectFit: "cover" }}
        />
      ) : (
        <Box
          sx={{
            height: 170,
            bgcolor: theme.palette.background.default,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Typography color="text.secondary">No course image</Typography>
        </Box>
      )}

      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          gap: 1.5,
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {course.category}
          </Typography>
          <CourseStatusChip status={course.status} />
        </Stack>

        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {course.title}
        </Typography>

        {course.subtitle && (
          <Typography variant="body2" color="text.secondary">
            {course.subtitle}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary">
          Level: {course.level}
        </Typography>

        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {course.price === 0 ? "Free" : `₹${course.price}`}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          component="a"
          href={`/instructor/courses/${course.id}`}
          variant="outlined"
          startIcon={<Edit3 size={17} />}
          fullWidth
        >
          Edit Course
        </Button>
      </CardContent>
    </Card>
  );
}
