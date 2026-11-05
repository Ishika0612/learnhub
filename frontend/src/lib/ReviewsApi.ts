import { apiRequest } from "@/lib/api";

export type CourseReview = {
  id: number;
  student_id: number;
  student_name?: string | null;
  student_profile_picture_url?: string | null;
  course_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type CourseRating = {
  course_id: number;
  average_rating: number;
  total_reviews: number;
};

export function getCourseReviews(courseId: number) {
  return apiRequest<CourseReview[]>(`/reviews/courses/${courseId}`);
}

export function getCourseRating(courseId: number) {
  return apiRequest<CourseRating>(`/reviews/courses/${courseId}/rating`);
}

export function createCourseReview(
  courseId: number,
  rating: number,
  comment: string,
) {
  return apiRequest<CourseReview>(`/reviews/courses/${courseId}`, {
    method: "POST",
    body: JSON.stringify({ rating, comment: comment.trim() || null }),
  });
}

export function updateCourseReview(
  reviewId: number,
  rating: number,
  comment: string,
) {
  return apiRequest<CourseReview>(`/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify({ rating, comment: comment.trim() || null }),
  });
}

export function deleteCourseReview(reviewId: number) {
  return apiRequest<void>(`/reviews/${reviewId}`, {
    method: "DELETE",
  });
}
