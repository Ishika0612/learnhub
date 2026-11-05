"use client";

import { motion } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  Clock3,
  Star,
  Users,
} from "lucide-react";
import { Avatar, Box, Button, Chip, Typography } from "@mui/material";
import Link from "next/link";
import theme from "@/theme";

import {
  formatPrice,
  formatStudents,
  type Course,
} from "../../lib/CoursesData";

type CourseCardProps = {
  course: Course;
  index: number;
  studentWorkspace?: boolean;
};

export default function CourseCard({
  course,
  index,
  studentWorkspace = false,
}: CourseCardProps) {
  const courseHref = studentWorkspace
    ? `/student/courses/${course.id}`
    : `/courses/${course.id}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.035, 0.2),
      }}
      whileHover={{ y: -5 }}
      style={{ height: "100%" }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2.5,
          transition: "box-shadow 0.25s ease, border-color 0.25s ease",
          "&:hover": {
            borderColor: theme.palette.secondary.light,
            boxShadow: `0 12px 28px ${theme.palette.primary.main}18`,
          },
        }}
      >
        <Box
          role="img"
          aria-label={`${course.title} course image`}
          sx={{
            position: "relative",
            height: 160,
            flexShrink: 0,
            overflow: "hidden",
            bgcolor: theme.palette.primary.light,
          }}
        >
          {/* Image layer */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("${course.image}")`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              transition: "transform 0.5s ease",
              ".course-card:hover &": {
                transform: "scale(1.07)",
              },
            }}
          />

          {/* Image overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(
                115deg,
                ${theme.palette.primary.dark}c9 0%,
                ${theme.palette.primary.main}70 55%,
                transparent 100%
              )`,
            }}
          />

          {/* Decorative circles */}
          <Box
            sx={{
              position: "absolute",
              width: 135,
              height: 135,
              right: -30,
              bottom: -65,
              borderRadius: "50%",
              border: `1px solid ${theme.palette.primary.contrastText}45`,
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              width: 90,
              height: 90,
              right: 35,
              top: -35,
              borderRadius: "50%",
              border: `1px solid ${theme.palette.primary.contrastText}35`,
              pointerEvents: "none",
            }}
          />

          <Typography
            aria-hidden="true"
            sx={{
              position: "absolute",
              left: 15,
              bottom: 18,
              zIndex: 1,
              maxWidth: "70%",
              color: theme.palette.common.white,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 1,
              textShadow: `0 1px 5px ${theme.palette.common.black}66`,
            }}
          >
            {course.category.toUpperCase()}
          </Typography>

          <Chip
            label={course.level}
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 2,
              height: 24,
              bgcolor: theme.palette.background.paper,
              color: theme.palette.primary.main,
              fontSize: 10,
              fontWeight: 700,
              "& .MuiChip-label": {
                px: 1.2,
              },
            }}
          />
        </Box>

        {/* Course information */}
        <Box
          className="course-card"
          sx={{
            p: { xs: 1.75, md: 2 },
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <Typography
            sx={{
              color: theme.palette.secondary.dark,
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.65,
            }}
          >
            {course.category}
          </Typography>

          <Typography
            component="h3"
            sx={{
              mt: 0.7,
              color: theme.palette.primary.main,
              fontSize: 15,
              fontWeight: 750,
              lineHeight: 1.45,
              letterSpacing: "-0.2px",
              minHeight: 44,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {course.title}
          </Typography>

          <Typography
            sx={{
              mt: 0.7,
              color: theme.palette.text.secondary,
              fontSize: 12,
              lineHeight: 1.65,
              minHeight: 59,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {course.subtitle}
          </Typography>

          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
            }}
          >
            <Avatar
              src={course.instructorImage ?? undefined}
              alt={`${course.instructor} profile`}
              sx={{
                width: 30,
                height: 30,
                bgcolor: theme.palette.primary.main,
                fontSize: 11,
                fontWeight: 700,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {course.instructor
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </Avatar>

            <Typography
              sx={{
                color: theme.palette.text.secondary,
                fontSize: 11,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {course.instructor}
            </Typography>
          </Box>

          {/* Display only metadata supplied by the backend. */}
          <Box
            sx={{
              mt: 1.7,
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              flexWrap: "wrap",
              color: theme.palette.text.secondary,
              fontSize: 10,
            }}
          >
            {course.rating !== undefined && course.reviews !== undefined && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.4,
              }}
            >
              <Star
                size={13}
                fill={theme.palette.warning.main}
                color={theme.palette.warning.main}
              />

              <Box
                component="span"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 800,
                }}
              >
                {course.rating.toFixed(1)}
              </Box>

              <Box component="span">
                ({formatStudents(course.reviews)})
              </Box>
            </Box>
            )}

            {course.students !== undefined && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.4,
              }}
            >
              <Users size={13} />
              <span>{formatStudents(course.students)}</span>
            </Box>
            )}

            {course.duration && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.4,
              }}
            >
              <Clock3 size={13} />
              <span>{course.duration}</span>
            </Box>
            )}

            {course.lectures !== undefined && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.4,
              }}
            >
              <BookOpen size={13} />
              <span>{course.lectures} lectures</span>
            </Box>
            )}
          </Box>

          {/* Price and course link */}
          <Box
            sx={{
              pt: 1.5,
              mt: "auto",
              borderTop: `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component="span"
                sx={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: theme.palette.primary.main,
                }}
              >
                {formatPrice(course.price)}
              </Typography>

              {course.originalPrice !== undefined && (
                <Typography
                  component="span"
                  sx={{
                    display: "block",
                    color: theme.palette.text.secondary,
                    fontSize: 10,
                    textDecoration: "line-through",
                  }}
                >
                  {formatPrice(course.originalPrice)}
                </Typography>
              )}
            </Box>

            <Button
              component={Link}
              href={courseHref}
              aria-label={`View ${course.title}`}
              endIcon={<ArrowUpRight size={14} />}
              sx={{
                flexShrink: 0,
                minWidth: 0,
                px: 1.2,
                py: 0.8,
                borderRadius: 1.7,
                color: theme.palette.primary.main,
                bgcolor: theme.palette.background.default,
                textTransform: "none",
                fontWeight: 750,
                fontSize: 11,
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                "& .MuiButton-endIcon": {
                  ml: 0.4,
                  transition: "transform 0.2s ease",
                },
                "&:hover": {
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  "& .MuiButton-endIcon": {
                    transform: "translate(2px, -2px)",
                  },
                },
              }}
            >
              View course
            </Button>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}