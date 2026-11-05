import type { ReactNode } from "react";
import InstructorLayout from "@/components/instructor/InstructorLayout";

export default function InstructorWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <InstructorLayout>{children}</InstructorLayout>;
}
