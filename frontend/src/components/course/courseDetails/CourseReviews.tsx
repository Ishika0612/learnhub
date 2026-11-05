"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Rating,
  TextField,
  Typography,
} from "@mui/material";
import { MessageSquare, Send } from "lucide-react";
import { motion } from "motion/react";
import {
  createCourseReview,
  getCourseRating,
  getCourseReviews,
} from "@/lib/ReviewsApi";
import type { Course } from "../../../lib/CoursesData";
import theme from "@/theme";

type CourseReviewsProps = {
  course: Course;
};

type Review = {
  id: number;
  studentId: number;
  name: string;
  image: string | null;
  rating: number;
  date: string;
  comment: string | null;
};

export default function CourseReviews({ course }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [apiRating, setApiRating] = useState(0);
  const [apiReviewCount, setApiReviewCount] = useState(0);

  useEffect(() => {
    let active = true;
    const courseId = Number(course.id);

    Promise.all([getCourseReviews(courseId), getCourseRating(courseId)])
      .then(([items, summary]) => {
        if (!active) return;
        setReviews(
          items.map((item) => ({
            id: item.id,
            studentId: item.student_id,
            name: item.student_name ?? "Student",
            image: item.student_profile_picture_url ?? null,
            rating: item.rating,
            date: new Date(item.created_at).toLocaleDateString(),
            comment: item.comment,
          })),
        );
        setApiRating(summary.average_rating);
        setApiReviewCount(summary.total_reviews);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load course reviews.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [course.id]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return apiRating;
    return (
      reviews.reduce((total, review) => total + review.rating, 0) /
      reviews.length
    );
  }, [apiRating, reviews]);

  const ratingCounts = [5, 4, 3, 2, 1].map((value) => ({
    value,
    count: reviews.filter((review) => review.rating === value).length,
  }));

  async function handleSubmit() {
    if (!comment.trim() || !rating) {
      setError("Please choose a rating and enter a review.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const result = await createCourseReview(
        Number(course.id),
        rating,
        comment,
      );
      setReviews((previous) => [
        {
          id: result.id,
          studentId: result.student_id,
          name: result.student_name ?? "Student",
          image: result.student_profile_picture_url ?? null,
          rating: result.rating,
          date: new Date(result.created_at).toLocaleDateString(),
          comment: result.comment,
        },
        ...previous,
      ]);
      setApiReviewCount((count) => count + 1);
      setApiRating((previous) =>
        reviews.length === 0
          ? result.rating
          : (previous * reviews.length + result.rating) / (reviews.length + 1),
      );
      setRating(5);
      setComment("");
      setShowForm(false);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not submit your review.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ mt: 5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 0.5 }}
          >
            Student reviews
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Ratings and reviews from enrolled students.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<MessageSquare size={17} />}
          onClick={() => setShowForm((previous) => !previous)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderColor: theme.palette.divider,
            color: theme.palette.primary.main,
            borderRadius: 2,
          }}
        >
          {showForm ? "Cancel review" : "Write a review"}
        </Button>
      </Box>

      {error && !showForm && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2, sm: 3 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" },
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "center",
              borderRight: { sm: `1px solid ${theme.palette.divider}` },
              pr: { sm: 3 },
            }}
          >
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, color: theme.palette.primary.main }}
            >
              {averageRating.toFixed(1)}
            </Typography>

            <Rating value={averageRating} precision={0.1} readOnly />

            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, mt: 1, textAlign: "center" }}
            >
              {apiReviewCount} {apiReviewCount === 1 ? "review" : "reviews"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {ratingCounts.map(({ value, count }) => {
              const percentage =
                reviews.length > 0 ? (count / reviews.length) * 100 : 0;

              return (
                <Box
                  key={value}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "40px minmax(0, 1fr) 30px",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {value} star
                  </Typography>

                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 10,
                      bgcolor: theme.palette.divider,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${percentage}%`,
                        height: "100%",
                        borderRadius: 10,
                        bgcolor: theme.palette.warning.main,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary, textAlign: "right" }}
                  >
                    {count}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {showForm && (
        <Card
          component={motion.div}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, mb: 2, color: theme.palette.text.primary }}
            >
              Share your feedback
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, mb: 0.75 }}
                >
                  Your rating
                </Typography>
                <Rating
                  value={rating}
                  onChange={(_, newValue) => setRating(newValue)}
                  size="large"
                />
              </Box>

              <TextField
                label="Your review"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                multiline
                minRows={3}
                fullWidth
                placeholder={`What did you think about ${course.title}?`}
              />

              {error && (
                <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
                  {error}
                </Typography>
              )}

              <Box>
                <Button
                  variant="contained"
                  startIcon={<Send size={16} />}
                  onClick={() => void handleSubmit()}
                  disabled={submitting}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                    "&:hover": { bgcolor: theme.palette.primary.light },
                  }}
                >
                  {submitting ? "Submitting..." : "Submit review"}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : reviews.length === 0 ? (
        <Typography role="status" sx={{ color: theme.palette.text.secondary, py: 3 }}>
          No reviews yet. Enroll in this course to be the first to share a
          review.
        </Typography>
      ) : (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
          >
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Avatar
                    src={review.image ?? undefined}
                    alt={review.name}
                    sx={{
                      bgcolor: theme.palette.secondary.light,
                      color: theme.palette.primary.main,
                      fontWeight: 800,
                    }}
                  >
                    {review.name.charAt(0).toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, color: theme.palette.text.primary }}
                      >
                        {review.name}
                      </Typography>

                      <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                        {review.date}
                      </Typography>
                    </Box>

                    <Box sx={{ my: 0.5 }}>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary, lineHeight: 1.8 }}
                    >
                      {review.comment || "No written comment."}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
      )}
    </Box>
  );
}