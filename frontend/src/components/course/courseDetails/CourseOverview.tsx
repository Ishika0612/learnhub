"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
} from "lucide-react";
import theme from "@/theme";
import { formatPrice, type Course } from "../../../lib/CoursesData";
import CourseHero from "./CourseHero";
import CourseReviews from "./CourseReviews";
import CourseShare from "./CourseShare";
import EnrollmentDialog from "./EnrollmentDialog";
import InstructorInfo from "./InstructorInfo";
import RelatedCourses from "./RelatedCourses";

type CourseOverviewProps = {
  course: Course;
};

export default function CourseOverview({ course }: CourseOverviewProps) {
  const pathname = usePathname();
  const coursesPath = pathname.startsWith("/student/learn")
    ? "/student"
    : "/courses";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Button
          component="a"
          href={coursesPath}
          sx={{
            mb: 2,
            px: 0,
            color: theme.palette.primary.main,
            textTransform: "none",
            "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
          }}
        >
          ← Back to courses
        </Button>

        <CourseHero course={course} />

        {(course.curriculum ?? []).length === 0 && (
          <Typography role="status" sx={{ mt: 2, color: theme.palette.text.secondary }}>
            Course curriculum is not available yet.
          </Typography>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 330px" },
            alignItems: "start",
            gap: { xs: 3, md: 4 },
            mt: { xs: 3, md: 4 },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box
              component="section"
              sx={{
                p: { xs: 2.5, md: 3 },
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
              }}
            >
              <Typography
                component="h2"
                sx={{ color: theme.palette.primary.main, fontSize: 22, fontWeight: 800 }}
              >
                About this course
              </Typography>
              <Typography
                sx={{
                  mt: 1.5,
                  color: theme.palette.text.secondary,
                  fontSize: 14,
                  lineHeight: 1.9,
                }}
              >
                {course.description}
              </Typography>
            </Box>

            {(course.whatYouWillLearn ?? []).length > 0 && (
            <Box
              component="section"
              sx={{
                mt: 3,
                p: { xs: 2.5, md: 3 },
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
              }}
            >
              <Typography
                component="h2"
                sx={{ color: theme.palette.primary.main, fontSize: 22, fontWeight: 800 }}
              >
                What you&apos;ll learn
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                  mt: 2,
                }}
              >
                {(course.whatYouWillLearn ?? []).map((item) => (
                  <Box
                    key={item}
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                  >
                    <CheckCircle2
                      size={17}
                      color={theme.palette.success.main}
                      style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    <Typography
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: 13,
                        lineHeight: 1.7,
                      }}
                    >
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            )}

            {(course.curriculum ?? []).length > 0 && (
            <Box component="section" sx={{ mt: 3 }}>
              <Typography
                component="h2"
                sx={{
                  mb: 2,
                  color: theme.palette.primary.main,
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                Course curriculum
              </Typography>
              {(course.curriculum ?? []).map((section, index) => (
                <Accordion
                  key={section.title}
                  defaultExpanded={index === 0}
                  disableGutters
                  elevation={0}
                  sx={{
                    mb: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "12px !important",
                    bgcolor: theme.palette.background.paper,
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                        pr: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                        {section.title}
                      </Typography>
                      <Typography
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {section.lessons.length} lessons
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {section.lessons.map((lesson) => (
                        <Typography
                          key={lesson}
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: 13,
                            lineHeight: 1.6,
                          }}
                        >
                          {lesson}
                        </Typography>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
            )}

            {(course.requirements ?? []).length > 0 && (
            <Box
              component="section"
              sx={{
                mt: 3,
                p: { xs: 2.5, md: 3 },
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
              }}
            >
              <Typography
                component="h2"
                sx={{ color: theme.palette.primary.main, fontSize: 22, fontWeight: 800 }}
              >
                Requirements
              </Typography>
              <Box component="ul" sx={{ pl: 2.5, mb: 0 }}>
                {(course.requirements ?? []).map((requirement) => (
                  <Typography
                    key={requirement}
                    component="li"
                    sx={{
                      mt: 1,
                      color: theme.palette.text.secondary,
                      fontSize: 13,
                      lineHeight: 1.7,
                    }}
                  >
                    {requirement}
                  </Typography>
                ))}
              </Box>
            </Box>
            )}

            <InstructorInfo course={course} />
            <CourseReviews course={course} />
            <CourseShare course={course} />
            <RelatedCourses course={course} />
          </Box>

          <Box
            sx={{
              position: { md: "sticky" },
              top: { md: 24 },
              p: 2.5,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              boxShadow: `0 12px 35px ${theme.palette.primary.main}12`,
            }}
          >
            <Box
              role="img"
              aria-label={`${course.title} course artwork`}
              sx={{
                height: 170,
                mb: 2.5,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: theme.palette.primary.light,
                backgroundImage: `linear-gradient(120deg, ${theme.palette.primary.dark}cc, ${theme.palette.primary.light}99), url("${course.image}")`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              <Typography
                aria-hidden="true"
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textAlign: "center",
                  px: 2,
                  textShadow: `0 1px 5px ${theme.palette.common.black}73`,
                }}
              >
                {course.category.toUpperCase()}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                {formatPrice(course.price)}
              </Typography>
              {course.originalPrice !== undefined && (
                <Typography
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: 14,
                    textDecoration: "line-through",
                  }}
                >
                  {formatPrice(course.originalPrice)}
                </Typography>
              )}
            </Box>

            <EnrollmentDialog course={course} />
            <Button
              component="a"
              href={`/learn/${course.id}`}
              variant="outlined"
              fullWidth
              endIcon={<ArrowRight size={17} />}
              sx={{
                mt: 1,
                py: 1.2,
                borderRadius: 2,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                fontWeight: 700,
              }}
            >
              Open learning area (enrolled students)
            </Button>

            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                display: "flex",
                flexDirection: "column",
                gap: 1.2,
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                This course includes:
              </Typography>
              {course.duration && (
                <Typography sx={{ display: "flex", gap: 1, fontSize: 12, color: theme.palette.text.secondary }}>
                  <Clock3 size={15} /> {course.duration} of content
                </Typography>
              )}
              {course.lectures !== undefined && (
                <Typography sx={{ display: "flex", gap: 1, fontSize: 12, color: theme.palette.text.secondary }}>
                  <BookOpen size={15} /> {course.lectures} lessons
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
