import { apiRequest } from "@/lib/api";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type InstructorApplication = {
  id: number;
  full_name: string;
  email: string;
  bio: string | null;
  phone_number: string | null;
  profile_picture_url: string | null;
  instructor_status: ApplicationStatus;
  instructor_rejection_reason: string | null;
  created_at: string;
};

export function getInstructorApplications(): Promise<InstructorApplication[]> {
  return apiRequest<InstructorApplication[]>("/admin/instructors");
}

export async function decideInstructorApplication(
  id: number,
  status: "approved" | "rejected",
  rejectionReason?: string,
): Promise<void> {
  await apiRequest<InstructorApplication>(
    `/admin/instructors/${id}/${status === "approved" ? "approve" : "reject"}`,
    {
      method: "PATCH",
      ...(status === "rejected"
        ? {
            body: JSON.stringify({
              rejection_reason: rejectionReason?.trim() ?? "",
            }),
          }
        : {}),
    },
  );
}
