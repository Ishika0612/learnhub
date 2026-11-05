
"use client";

import { useParams } from "next/navigation";
import EditCourseForm from "@/components/instructor/EditCourseForm";

export default function EditInstructorCoursePage() {
  const params = useParams<{ id: string }>();
  return <EditCourseForm courseId={params.id} />;
}
