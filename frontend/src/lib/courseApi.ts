import { apiRequest } from "@/lib/api";
import type { Course } from "@/lib/CoursesData";

export type BackendCourse = {
  id: number;
  title: string;
  subtitle: string | null;
  description: string;
  category: string;
  level: string;
  price: number | string;
  thumbnail_url: string | null;
  instructor_id: number;
  instructor_name?: string | null;
  instructor_profile_picture_url?: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
};

export type BackendLesson = {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  video_url: string | null;
  position: number;
};

export type BackendEnrollment = {
  id: number;
  student_id: number;
  course_id: number;
  progress: number;
  enrolled_at: string;
};

export type BackendLessonProgress = {
  id: number;
  student_id: number;
  lesson_id: number;
  is_completed: boolean;
  completed_at: string | null;
};

export function mapBackendCourse(course: BackendCourse): Course {
  const price = Number(course.price);
  if (!Number.isFinite(price)) {
    throw new Error(`Course ${course.id} has an invalid price.`);
  }

  return {
    id: String(course.id),
    title: course.title,
    subtitle: course.subtitle ?? course.description,
    instructor: course.instructor_name ?? "Instructor",
    instructorImage: course.instructor_profile_picture_url,
    category: course.category,
    level: course.level,
    price,
    image: course.thumbnail_url ?? "",
    description: course.description,
  };
}

export async function getApprovedCourses() {
  const courses = await apiRequest<BackendCourse[]>("/courses");
  return courses.map(mapBackendCourse);
}

export async function getCourseLessons(courseId: string) {
  return apiRequest<BackendLesson[]>(
    `/courses/${encodeURIComponent(courseId)}/lessons`,
  );
}

export async function enrollInCourse(courseId: string) {
  return apiRequest<BackendEnrollment>(
    `/enrollments/${encodeURIComponent(courseId)}`,
    { method: "POST" },
  );
}

export async function getMyEnrollments() {
  return apiRequest<BackendEnrollment[]>("/enrollments/me");
}

export async function getLessonProgress(courseId: string) {
  return apiRequest<BackendLessonProgress[]>(
    `/courses/${encodeURIComponent(courseId)}/my-lesson-progress`,
  );
}

export async function updateLessonProgress(
  lessonId: number,
  isCompleted: boolean,
) {
  return apiRequest<BackendLessonProgress>(
    `/lessons/${lessonId}/progress`,
    {
      method: "PATCH",
      body: JSON.stringify({ is_completed: isCompleted }),
    },
  );
}

export async function getMyEnrolledCourseIds(): Promise<string[]> {
  const enrollments = await apiRequest<
    Array<{ course_id: number | string }>
  >("/enrollments/me");

  return enrollments.map((enrollment) =>
    String(enrollment.course_id)
  );
}
