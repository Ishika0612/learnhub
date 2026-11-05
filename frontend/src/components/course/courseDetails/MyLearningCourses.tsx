"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";
import { motion } from "motion/react";
import { apiRequest, getAccessToken, type ApiUser } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";
import theme from "@/theme";

type StudentDashboard = {
  courses: Array<{
    course_id: number;
    title: string;
    subtitle: string | null;
    category: string;
    level: string;
    thumbnail_url: string | null;
    instructor_id: number;
    instructor_name: string | null;
    instructor_profile_picture_url: string | null;
    progress: number;
  }>;
};

type EnrolledCourse = {
  id: string;
  title: string;
  instructor: string;
  instructorImage: string | null;
  category: string;
  image: string;
  progress: number;
};

export default function MyLearningCourses() {
  const [filter, setFilter] = useState<"all" | "in-progress" | "completed">(
    "all"
  );
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<ApiUser | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<
    EnrolledCourse[]
  >([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStudentData() {
      try {
        if (!getAccessToken()) {
          return { user: null, courses: [], error: "" };
        }

        const [currentUser, dashboard] = await Promise.all([
          apiRequest<ApiUser>("/auth/me"),
          apiRequest<StudentDashboard>("/dashboard/student"),
        ]);
        if (currentUser.role !== "student") {
          throw new Error("My Learning is available to student accounts only.");
        }

        const enrolledCourses: EnrolledCourse[] = dashboard.courses.map((item) => ({
          id: String(item.course_id),
          title: item.title,
          instructor: item.instructor_name ?? "Instructor",
          instructorImage: item.instructor_profile_picture_url,
          category: item.category,
          image: item.thumbnail_url ?? "",
          progress: item.progress,
        }));
        return { user: currentUser, courses: enrolledCourses, error: "" };
      } catch (cause) {
        return {
          user: null,
          courses: [],
          error:
            cause instanceof Error
              ? cause.message
              : "Could not load your account courses.",
        };
      }
    }

    void loadStudentData().then((result) => {
      if (!active) return;
      setSession(result.user);
      setEnrolledCourses(result.courses);
      setLoadError(result.error);
      setReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  const filteredCourses = enrolledCourses.filter((course) => {
    const matchesProgress =
      filter === "all" ||
      (filter === "completed"
        ? course.progress === 100
        : course.progress < 100);
    const search = query.trim().toLowerCase();
    const matchesSearch =
      !search ||
      [course.title, course.category, course.instructor].some((value) =>
        value.toLowerCase().includes(search),
      );
    return matchesProgress && matchesSearch;
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, py: 5 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>
        {!ready ? (
          <Typography role="status" sx={{ color: theme.palette.text.secondary }}>
            Loading your student account...
          </Typography>
        ) : !session ? (
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              textAlign: "center",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <BookOpen size={36} color={theme.palette.text.disabled} />
            <Typography sx={{ fontWeight: 800, mt: 2 }}>
              Log in as a student to view your courses
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1, mb: 2 }}>
              Courses you enroll in will appear here in your account.
            </Typography>
            {loadError && (
              <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>
                {loadError}
              </Alert>
            )}
            <Button
              component="a"
              href="/login?redirect=%2Fstudent%2Fmy-learning"
              variant="contained"
              sx={{ bgcolor: theme.palette.primary.main, textTransform: "none" }}
            >
              Continue as student
            </Button>
          </Card>
        ) : (
          <>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1 }}
            >
              My Learning
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary }}>
              Pick up where you left off and keep making progress.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.75 }}>
              <Avatar
                src={session.profile_picture_url ?? undefined}
                alt={session.full_name}
                sx={{ width: 24, height: 24, fontSize: 12 }}
              >
                {session.full_name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography sx={{ color: theme.palette.text.secondary, fontSize: 13 }}>
                Signed in as {session.full_name} ({session.email})
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              component="a"
              href="/student/profile"
              variant="outlined"
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Profile
            </Button>
            <Button
              component="a"
              href="/student/courses"
              variant="contained"
              endIcon={<ArrowRight size={17} />}
              sx={{
                bgcolor: theme.palette.primary.main,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                "&:hover": { bgcolor: theme.palette.primary.light },
              }}
            >
              Explore courses
            </Button>
            <Button
              onClick={() => {
                clearAccessToken();
                setSession(null);
                setEnrolledCourses([]);
              }}
              variant="outlined"
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Sign out
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
            mb: 4,
          }}
        >
          {[
            {
              label: "Enrolled courses",
              value: enrolledCourses.length,
              icon: <BookOpen size={20} />,
            },
            {
              label: "In progress",
              value: enrolledCourses.filter(
                (course) => course.progress < 100
              ).length,
              icon: <PlayCircle size={20} />,
            },
            {
              label: "Completed",
              value: enrolledCourses.filter(
                (course) => course.progress === 100
              ).length,
              icon: <ArrowRight size={20} />,
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ display: "flex", gap: 2, p: 2.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: theme.palette.secondary.light,
                    color: theme.palette.primary.main,
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: theme.palette.text.primary }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {stat.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {[
              { label: "All courses", value: "all" },
              { label: "In progress", value: "in-progress" },
              { label: "Completed", value: "completed" },
            ].map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                clickable
                onClick={() =>
                  setFilter(item.value as "all" | "in-progress" | "completed")
                }
                aria-pressed={filter === item.value}
                sx={{
                  bgcolor: filter === item.value ? theme.palette.primary.main : theme.palette.background.paper,
                  color: filter === item.value ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                  border: "1px solid",
                  borderColor: filter === item.value ? theme.palette.primary.main : theme.palette.divider,
                  fontWeight: 700,
                }}
              />
            ))}
          </Box>
          <TextField
            size="small"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search my courses"
            slotProps={{ htmlInput: { "aria-label": "Search my learning courses" } }}
            sx={{ width: { xs: "100%", sm: 280 }, bgcolor: theme.palette.background.paper }}
          />
        </Box>

        {filteredCourses.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              p: 5,
              textAlign: "center",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <BookOpen size={36} color={theme.palette.text.disabled} />
            <Typography sx={{ fontWeight: 800, mt: 2 }}>
              {enrolledCourses.length === 0
                ? "You haven't enrolled in any courses yet"
                : "No courses found"}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
              Try another filter or explore the course catalog.
            </Typography>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2.5,
            }}
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.07 }}
                whileHover={{ y: -3 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    overflow: "hidden",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: "100%", sm: 190 },
                      minWidth: { sm: 190 },
                      height: { xs: 190, sm: "auto" },
                      minHeight: { sm: 210 },
                      bgcolor: theme.palette.divider,
                    }}
                  >
                    <Typography
                      aria-hidden="true"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        px: 2,
                        color: theme.palette.common.white,
                        fontWeight: 800,
                        letterSpacing: 1,
                        textAlign: "center",
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.accent.main})`,
                      }}
                    >
                      {course.category.toUpperCase()}
                    </Typography>
                    <Box
                      component="img"
                      src={course.image}
                      alt={course.title}
                      loading="lazy"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </Box>

                  <CardContent
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      p: 2.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        size="small"
                        label={course.category}
                        sx={{
                          bgcolor: theme.palette.secondary.light,
                          color: theme.palette.primary.main,
                          fontWeight: 700,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {course.progress === 100 ? "Completed" : "Learning"}
                      </Typography>
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: theme.palette.text.primary,
                        lineHeight: 1.4,
                        mb: 0.75,
                      }}
                    >
                      {course.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary, mb: 2 }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Avatar
                          src={course.instructorImage ?? undefined}
                          alt={course.instructor}
                          sx={{ width: 22, height: 22, fontSize: 12 }}
                        >
                          {course.instructor.charAt(0).toUpperCase()}
                        </Avatar>
                        {course.instructor}
                      </Box>
                    </Typography>

                    <Box sx={{ mt: "auto" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}
                        >
                          Course progress
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.primary.main, fontWeight: 800 }}
                        >
                          {course.progress}%
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={course.progress}
                        sx={{
                          height: 7,
                          borderRadius: 5,
                          bgcolor: theme.palette.divider,
                          mb: 2,
                          "& .MuiLinearProgress-bar": {
                            bgcolor:
                              course.progress === 100 ? theme.palette.success.main : theme.palette.primary.main,
                            borderRadius: 5,
                          },
                        }}
                      />

                      <Button
                        component="a"
                        href={`/student/learn/${course.id}`}
                        fullWidth
                        variant="outlined"
                        endIcon={<ArrowRight size={16} />}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderColor: theme.palette.divider,
                          color: theme.palette.primary.main,
                          borderRadius: 2,
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                            bgcolor: theme.palette.background.default,
                          },
                        }}
                      >
                        {course.progress === 100
                          ? "Review course"
                          : "Continue learning"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        )}
          </>
        )}
      </Box>
    </Box>
  );
}