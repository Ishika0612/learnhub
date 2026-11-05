
import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import CreateCourseForm from "@/components/instructor/CreateCourseForm";

export default function CreateCoursePage() {
  return (
    <Box sx={{ maxWidth: 950, mx: "auto" }}>
      <Link
        href="/instructor/courses"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
          color: "#001F54",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={17} />
        Back to courses
      </Link>

      <Typography variant="h4" sx={{ fontWeight: 800, color: "#001F54" }}>
        Create a Course
      </Typography>

      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Share your knowledge with learners. Your course will be reviewed
        before it becomes available to students.
      </Typography>

      <CreateCourseForm />
    </Box>
  );
}
