
import { apiRequest } from "@/lib/api";

export type InstructorDashboardData = {
  total_courses: number;
  approved_courses: number;
  pending_courses: number;
  rejected_courses: number;
  total_enrollments: number;
  average_progress: number;
};

export async function getInstructorDashboard(): Promise<InstructorDashboardData> {
  return apiRequest<InstructorDashboardData>("/dashboard/instructor", {
    cache: "no-store",
  });
}
