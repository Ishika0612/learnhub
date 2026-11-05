import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import CoursePage from "@/components/course/CoursePage";

export default function StudentCoursesPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <CoursePage />
    </Suspense>
  );
}
