import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import CourseDetailsClient from "@/components/course/CourseDetailsClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function CourseDetailsContent({ params }: PageProps) {
  const { id } = await params;
  return <CourseDetailsClient courseId={id} />;
}

export default function CourseDetailsPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <CourseDetailsContent params={params} />
    </Suspense>
  );
}