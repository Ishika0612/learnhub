import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import LearningPageClient from "@/components/course/LearningPageClient";

type LearnPageProps = {
  params: Promise<{ id: string }>;
};

async function LearnPageContent({ params }: LearnPageProps) {
  const { id } = await params;
  return <LearningPageClient courseId={id} />;
}

export default function LearnPage({ params }: LearnPageProps) {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <LearnPageContent params={params} />
    </Suspense>
  );
}
