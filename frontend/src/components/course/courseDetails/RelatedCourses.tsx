"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Card, CardContent, Typography } from "@mui/material";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import theme from "@/theme";
import { formatPrice, type Course } from "../../../lib/CoursesData";
import { getApprovedCourses } from "@/lib/courseApi";

type RelatedCoursesProps = {
  course: Course;
};

export default function RelatedCourses({ course }: RelatedCoursesProps) {
  const isStudentWorkspace = usePathname().startsWith("/student/");
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getApprovedCourses()
      .then((items) => {
        if (active) setCourses(items.filter((item) => item.id !== course.id));
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Could not load related courses.");
        }
      });

    return () => {
      active = false;
    };
  }, [course.id]);

  const relatedCourses = [
    ...courses.filter((item) => item.category === course.category),
    ...courses.filter((item) => item.category !== course.category),
  ].slice(0, 3);

  if (!relatedCourses.length && !error) return null;

  return (
    <Box component="section" sx={{ mt: 3.5 }}>
      <Typography
        component="h2"
        sx={{ fontSize: { xs: 20, md: 22 }, fontWeight: 800, color: theme.palette.text.primary, mb: 0.5 }}
      >
        Related courses
      </Typography>
      <Typography sx={{ fontSize: 13, color: theme.palette.text.secondary, mb: 2 }}>
        Explore other published courses.
      </Typography>
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
            gap: 1.75,
          }}
        >
          {relatedCourses.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              style={{ height: "100%" }}
            >
              <Card
                component="a"
                href={
                  isStudentWorkspace
                    ? `/student/courses/${item.id}`
                    : `/courses/${item.id}`
                }
                elevation={0}
                sx={{
                  display: "block",
                  height: "100%",
                  overflow: "hidden",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2.5,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                {item.image && (
                  <Box
                    component="img"
                    src={item.image}
                    alt=""
                    sx={{ width: "100%", height: 115, objectFit: "cover" }}
                  />
                )}
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography
                    component="h3"
                    sx={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: theme.palette.text.primary,
                      lineHeight: 1.45,
                      mb: 0.6,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: theme.palette.text.secondary, mb: 1.2 }}>
                    By {item.instructor}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      pt: 1.2,
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography sx={{ fontSize: 16, color: theme.palette.primary.main, fontWeight: 800 }}>
                      {formatPrice(item.price)}
                    </Typography>
                    <Typography sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, fontSize: 11, color: theme.palette.primary.main, fontWeight: 700 }}>
                      Explore <ArrowRight size={13} />
                    </Typography>
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
