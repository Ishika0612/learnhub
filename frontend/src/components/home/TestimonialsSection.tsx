"use client";

import { useEffect, useState } from "react";
import { Avatar, Box, Container, Rating, Typography } from "@mui/material";
import { Quote } from "lucide-react";
import { motion } from "motion/react";
import theme from "@/theme";
import { getApprovedCourses } from "@/lib/courseApi";
import { getCourseReviews, type CourseReview } from "@/lib/ReviewsApi";

type Testimonial = CourseReview & { courseTitle: string };

const MotionBox = motion.create(Box);

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadReviews() {
      try {
        const courses = await getApprovedCourses();
        const reviewGroups = await Promise.all(
          courses.map(async (course) => ({
            courseTitle: course.title,
            reviews: await getCourseReviews(Number(course.id)),
          })),
        );
        if (!active) return;
        setTestimonials(
          reviewGroups
            .flatMap(({ courseTitle, reviews }) =>
              reviews
                .filter((review) => Boolean(review.comment?.trim()))
                .map((review) => ({ ...review, courseTitle })),
            )
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            )
            .slice(0, 3),
        );
      } catch (cause: unknown) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Could not load student reviews.");
        }
      }
    }

    void loadReviews();
    return () => {
      active = false;
    };
  }, []);

  if (!testimonials.length && !error) return null;

  return (
    <Box
      id="testimonials"
      component="section"
      sx={{ py: { xs: 8, md: 11 }, bgcolor: theme.palette.background.default }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            component="h2"
            sx={{
              color: theme.palette.primary.main,
              fontSize: { xs: "1.9rem", md: "2.7rem" },
              fontWeight: 800,
            }}
          >
            Student reviews
          </Typography>
          <Typography sx={{ mt: 1.5, color: theme.palette.text.secondary }}>
            Reviews submitted for courses on LearnHub.
          </Typography>
        </Box>
        {error ? (
          <Typography role="alert" sx={{ color: theme.palette.error.main }}>
            {error}
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
              gap: 2.5,
            }}
          >
            {testimonials.map((item, index) => (
              <MotionBox
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  p: 3,
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Rating value={item.rating} readOnly size="small" />
                  <Quote size={22} color={theme.palette.primary.light} />
                </Box>
                <Typography sx={{ flexGrow: 1, fontSize: 13, lineHeight: 1.9 }}>
                  {item.comment}
                </Typography>
                <Box
                  sx={{
                    mt: 3,
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Avatar
                    src={item.student_profile_picture_url ?? undefined}
                    alt={item.student_name ?? "Student"}
                    sx={{ bgcolor: theme.palette.primary.light }}
                  >
                    {item.student_name?.charAt(0).toUpperCase() ?? "S"}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                      {item.student_name ?? "Student"}
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: 11 }}>
                      {item.courseTitle}
                    </Typography>
                  </Box>
                </Box>
              </MotionBox>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
