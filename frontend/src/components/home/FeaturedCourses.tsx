"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  Box,
  Button,
  Chip,
  Container,
  Typography,
} from "@mui/material";
import theme from "@/theme";
import { formatPrice, type Course } from "@/lib/CoursesData";
import { getApprovedCourses } from "@/lib/courseApi";

const MotionBox = motion.create(Box);

export default function FeaturedCourses() {
  const [activeCategory, setActiveCategory] = useState("All Courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    getApprovedCourses()
      .then((items) => {
        if (active) setCourses(items);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load featured courses.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const featuredCourses = useMemo(
    () =>
      courses
        .filter(
          (course) =>
            activeCategory === "All Courses" ||
            course.category === activeCategory,
        )
        .slice(0, 4),
    [activeCategory, courses],
  );
  const availableCategories = useMemo(
    () => [
      "All Courses",
      ...new Set(courses.map((course) => course.category)),
    ],
    [courses],
  );

  return (
    <Box
      id="featured-courses"
      component="section"
      sx={{
        py: { xs: 8, md: 11 },
        bgcolor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "flex-end" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Chip
              icon={<Sparkles size={14} />}
              label="AVAILABLE COURSES"
              size="small"
              sx={{
                mb: 1.5,
                bgcolor: theme.palette.secondary.light,
                color: theme.palette.secondary.dark,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: 0.7,
              }}
            />

            <Typography
              component="h2"
              sx={{
                color: theme.palette.primary.main,
                fontSize: { xs: "1.8rem", md: "2.5rem" },
                fontWeight: 800,
                letterSpacing: "-1px",
              }}
            >
              Explore featured courses
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: theme.palette.text.secondary,
                fontSize: 14,
              }}
            >
              Practical courses to help you learn, grow, and achieve more.
            </Typography>
          </Box>

          <Button
            component="a"
            href="/courses"
            endIcon={<ArrowRight size={17} />}
            sx={{
              color: theme.palette.primary.main,
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              "&:hover": { bgcolor: theme.palette.secondary.light },
            }}
          >
            View all courses
          </Button>
        </MotionBox>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            pb: 1,
            mb: 3,
          }}
        >
          {availableCategories.map((category) => {
            const active = activeCategory === category;

            return (
              <Button
                key={category}
                onClick={() => setActiveCategory(category)}
                aria-pressed={active}
                sx={{
                  flexShrink: 0,
                  px: 2,
                  py: 0.9,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 700,
                  color: active
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.secondary,
                  bgcolor: active
                    ? theme.palette.primary.main
                    : theme.palette.background.paper,
                  transition: "all .2s ease",
                  "&:hover": {
                    bgcolor: active
                      ? theme.palette.primary.light
                      : theme.palette.secondary.light,
                    color: active
                      ? theme.palette.primary.contrastText
                      : theme.palette.primary.main,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {category}
              </Button>
            );
          })}
        </Box>

        {loadError ? (
          <Typography role="status" color="error">
            {loadError}
          </Typography>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: 2.5,
          }}
        >
          {featuredCourses.map((course, index) => (
            <MotionBox
              key={course.id}
              layout
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
              whileHover={{ y: -6 }}
              sx={{
                minWidth: 0,
                overflow: "hidden",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                bgcolor: theme.palette.background.paper,
                transition: "box-shadow .25s ease, border-color .25s ease",
                "&:hover": {
                  boxShadow: `0 16px 36px ${theme.palette.primary.main}1f`,
                  borderColor: theme.palette.secondary.light,
                },
              }}
            >
              <Box
                role="img"
                aria-label={`${course.title} course image`}
                sx={{
                  position: "relative",
                  height: 155,
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  bgcolor: theme.palette.primary.light,
                  backgroundImage: `linear-gradient(120deg, ${theme.palette.primary.dark}b8, ${theme.palette.primary.light}55), url("${course.image}")`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              >
                <Typography
                  aria-hidden="true"
                  sx={{
                    color: theme.palette.primary.contrastText,
                    fontWeight: 800,
                    fontSize: 15,
                    letterSpacing: 1,
                    textAlign: "center",
                    px: 2,
                    textShadow: `0 1px 5px ${theme.palette.common.black}73`,
                  }}
                >
                  {course.category.toUpperCase()}
                </Typography>
                <Chip
                  label={course.level}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.primary.main,
                    fontSize: 10,
                    height: 25,
                  }}
                />
              </Box>

              <Box sx={{ p: 2 }}>
                <Typography
                  sx={{
                    color: theme.palette.secondary.dark,
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                    mb: 1,
                  }}
                >
                  {course.category}
                </Typography>

                <Typography
                  component="h3"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 750,
                    fontSize: 15,
                    lineHeight: 1.45,
                    minHeight: 44,
                  }}
                >
                  {course.title}
                </Typography>

                <Typography
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: 12,
                    mt: 1,
                  }}
                >
                  By {course.instructor}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 2,
                    pt: 1.7,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8 }}>
                    <Typography
                      sx={{
                        color: theme.palette.primary.main,
                        fontSize: 20,
                        fontWeight: 800,
                      }}
                    >
                      {formatPrice(course.price)}
                    </Typography>
                  </Box>

                  <Button
                    component="a"
                    href={`/courses/${course.id}`}
                    aria-label={`View ${course.title}`}
                    sx={{
                      minWidth: 36,
                      width: 36,
                      height: 36,
                      p: 0,
                      borderRadius: 2,
                      bgcolor: theme.palette.background.default,
                      color: theme.palette.primary.main,
                      transition: "all .2s ease",
                      "&:hover": {
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                      },
                    }}
                  >
                    <ArrowRight size={17} />
                  </Button>
                </Box>
              </Box>
            </MotionBox>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
