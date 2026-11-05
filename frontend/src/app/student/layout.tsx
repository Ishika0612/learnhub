import type { ReactNode } from "react";
import StudentLayout from "@/components/student/StudentLayout";

export default function StudentWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <StudentLayout>{children}</StudentLayout>;
}
