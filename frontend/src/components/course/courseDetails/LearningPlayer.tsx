"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CirclePlay,
  Clock3,
  ListVideo,
  Play,
} from "lucide-react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import theme from "@/theme";
import {
  getLessonProgress,
  updateLessonProgress,
  type BackendLesson,
} from "@/lib/courseApi";
import type { Course } from "../../../lib/CoursesData";

type LearningPlayerProps = {
  course: Course;
  backendLessons: BackendLesson[];
};

type LessonItem = {
  id: string;
  backendId: number;
  title: string;
  section: number;
  lessonIndex: number;
  description: string | null;
  videoUrl: string | null;
};

export default function LearningPlayer({
  course,
  backendLessons,
}: LearningPlayerProps) {
  const coursePath = usePathname().startsWith("/student/learn")
    ? "/student"
    : `/courses/${course.id}`;

  const lessons = useMemo<LessonItem[]>(
    () =>
      backendLessons.map((lesson, lessonIndex) => ({
        id: String(lesson.id),
        backendId: lesson.id,
        title: lesson.title,
        section: 0,
        lessonIndex,
        description: lesson.description,
        videoUrl: lesson.video_url,
      })),
    [backendLessons],
  );

  const [activeLessonId, setActiveLessonId] = useState(
    lessons[0]?.id ?? ""
  );
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loadedCourseId, setLoadedCourseId] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<{
    courseId: string;
    message: string;
  } | null>(null);
  const [savingLessonId, setSavingLessonId] = useState<string | null>(null);
  const progressLoaded = loadedCourseId === course.id;
  const currentProgressError =
    progressError?.courseId === course.id ? progressError.message : "";

  useEffect(() => {
    let active = true;
    getLessonProgress(course.id)
      .then((progress) => {
        if (!active) return;
        setProgressError(null);
        setCompletedLessons(
          progress
            .filter((item) => item.is_completed)
            .map((item) => String(item.lesson_id)),
        );
        setActiveLessonId(lessons[0]?.id ?? "");
      })
      .catch((cause: unknown) => {
        if (active) {
          setProgressError(
            {
              courseId: course.id,
              message:
                cause instanceof Error
                  ? cause.message
                  : "Could not load your course progress.",
            },
          );
        }
      })
      .finally(() => {
        if (active) setLoadedCourseId(course.id);
      });

    return () => {
      active = false;
    };
  }, [course.id, lessons]);

  const activeIndex = lessons.findIndex(
    (lesson) => lesson.id === activeLessonId
  );
  const activeLesson = lessons[activeIndex];
  const progress = lessons.length
    ? Math.round((completedLessons.length / lessons.length) * 100)
    : 0;

  async function toggleComplete(lessonId: string) {
    const lesson = lessons.find((item) => item.id === lessonId);
    if (!lesson || savingLessonId) return;

    const isCompleted = !completedLessons.includes(lessonId);
    setSavingLessonId(lessonId);
    setProgressError(null);
    try {
      const saved = await updateLessonProgress(lesson.backendId, isCompleted);
      setCompletedLessons((previous) =>
        saved.is_completed
          ? [...new Set([...previous, lessonId])]
          : previous.filter((id) => id !== lessonId),
      );
    } catch (cause) {
      setProgressError({
        courseId: course.id,
        message:
          cause instanceof Error
            ? cause.message
            : "Could not save your lesson progress.",
      });
    } finally {
      setSavingLessonId(null);
    }
  }

  function goToLesson(index: number) {
    if (index >= 0 && index < lessons.length) {
      setActiveLessonId(lessons[index].id);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, pb: 5 }}>
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 2,
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Button
          component="a"
          href={coursePath}
          startIcon={<ArrowLeft size={17} />}
          sx={{
            color: theme.palette.primary.main,
            textTransform: "none",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          Course overview
        </Button>

        <Box
          sx={{
            width: 1,
            height: 28,
            borderLeft: `1px solid ${theme.palette.divider}`,
          }}
        />

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: theme.palette.text.primary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {course.title}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {course.instructor}
          </Typography>
        </Box>
      </Box>

      {(!progressLoaded || currentProgressError) && (
        <Box sx={{ maxWidth: 1440, mx: "auto", px: { xs: 2, md: 3 }, pt: 2 }}>
          {!progressLoaded && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Loading your saved course progress...
            </Alert>
          )}
          {currentProgressError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {currentProgressError}
            </Alert>
          )}
        </Box>
      )}

      <Box
        sx={{
          maxWidth: 1440,
          mx: "auto",
          p: { xs: 2, md: 3 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <motion.div
            key={activeLessonId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Paper
              elevation={0}
              sx={{
                aspectRatio: "16 / 9",
                minHeight: { xs: 220, sm: 350 },
                bgcolor: theme.palette.primary.dark,
                color: theme.palette.common.white,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                p: 3,
                overflow: "hidden",
              }}
            >
              {activeLesson?.videoUrl ? (
                <Box
                  component="video"
                  src={activeLesson.videoUrl}
                  controls
                  sx={{ width: "100%", height: "100%", maxHeight: 550 }}
                >
                  Your browser does not support video playback.
                </Box>
              ) : (
                <>
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  bgcolor: `${theme.palette.common.white}1f`,
                  display: "grid",
                  placeItems: "center",
                  mb: 2,
                }}
              >
                <Play size={32} fill="white" />
              </Box>

              <Typography
                variant="h6"
                sx={{ fontWeight: 800, mb: 1 }}
              >
                {activeLesson?.title ?? "Course content"}
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: theme.palette.divider, maxWidth: 420 }}
              >
                Video content has not been added to this lesson yet.
              </Typography>
                </>
              )}
            </Paper>
          </motion.div>

          <Paper
            elevation={0}
            sx={{
              mt: 2.5,
              p: { xs: 2, md: 3 },
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}
                >
                  Lesson {Math.max(activeIndex + 1, 0)} of {lessons.length}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: theme.palette.text.primary, mt: 0.5 }}
                >
                  {activeLesson?.title ?? "No lessons available"}
                </Typography>
              </Box>

              {activeLesson && (
                <Button
                  variant={
                    completedLessons.includes(activeLesson.id)
                      ? "outlined"
                      : "contained"
                  }
                  startIcon={<CheckCircle2 size={17} />}
                  onClick={() => toggleComplete(activeLesson.id)}
                  disabled={!progressLoaded || savingLessonId === activeLesson.id}
                  aria-pressed={completedLessons.includes(activeLesson.id)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    flexShrink: 0,
                    bgcolor: completedLessons.includes(activeLesson.id)
                      ? "transparent"
                      : theme.palette.primary.main,
                    color: completedLessons.includes(activeLesson.id)
                      ? theme.palette.success.main
                      : theme.palette.background.paper,
                    borderColor: theme.palette.success.main,
                    "&:hover": {
                      bgcolor: completedLessons.includes(activeLesson.id)
                        ? theme.palette.success.light
                        : theme.palette.primary.light,
                    },
                  }}
                >
                  {savingLessonId === activeLesson.id
                    ? "Saving..."
                    : completedLessons.includes(activeLesson.id)
                    ? "Completed"
                    : "Mark complete"}
                </Button>
              )}
            </Box>

            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, lineHeight: 1.9, mt: 2 }}
            >
              Work through each lesson at your own pace. Mark lessons as
              complete to track your learning progress.
            </Typography>

            <Box
              sx={{
                mt: 3,
                pt: 2.5,
                borderTop: `1px solid ${theme.palette.divider}`,
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Button
                startIcon={<ArrowLeft size={16} />}
                disabled={activeIndex <= 0}
                onClick={() => goToLesson(activeIndex - 1)}
                sx={{ textTransform: "none", color: theme.palette.primary.main }}
              >
                Previous
              </Button>

              <Button
                endIcon={<ArrowRight size={16} />}
                disabled={activeIndex < 0 || activeIndex >= lessons.length - 1}
                onClick={() => goToLesson(activeIndex + 1)}
                sx={{ textTransform: "none", color: theme.palette.primary.main }}
              >
                Next lesson
              </Button>
            </Box>
          </Paper>
        </Box>

        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2.5, bgcolor: theme.palette.background.paper }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <ListVideo size={21} color={theme.palette.primary.main} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: theme.palette.text.primary }}
              >
                Course content
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Your progress
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.primary.main, fontWeight: 800 }}
              >
                {progress}%
              </Typography>
            </Box>

            <LinearProgress
              aria-label="Course completion progress"
              variant="determinate"
              value={progress}
              sx={{
                height: 7,
                borderRadius: 5,
                bgcolor: theme.palette.divider,
                "& .MuiLinearProgress-bar": {
                  bgcolor: theme.palette.primary.main,
                  borderRadius: 5,
                },
              }}
            />

            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary, display: "block", mt: 1 }}
            >
              {completedLessons.length} of {lessons.length} lessons completed
            </Typography>
          </Box>

          <Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
            {(course.curriculum ?? []).map((section, sectionIndex) => {
              const sectionLessons = lessons.filter(
                (lesson) => lesson.section === sectionIndex
              );

              return (
                <Accordion
                  key={sectionIndex}
                  defaultExpanded={sectionIndex === 0}
                  disableGutters
                  elevation={0}
                  sx={{
                    "&:before": { display: "none" },
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ChevronDown size={18} />}
                    sx={{ px: 2, py: 0.5 }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, color: theme.palette.text.primary }}
                      >
                        {section.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {sectionLessons.length} lessons
                      </Typography>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 0 }}>
                    {sectionLessons.map((lesson) => {
                      const isActive = lesson.id === activeLessonId;
                      const isComplete = completedLessons.includes(lesson.id);

                      return (
                        <Box
                          key={lesson.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                            px: 2,
                            py: 1.5,
                            bgcolor: isActive ? theme.palette.accent.light : theme.palette.background.paper,
                            borderLeft: "3px solid",
                            borderColor: isActive ? theme.palette.primary.main : "transparent",
                            "&:hover": { bgcolor: theme.palette.background.default },
                          }}
                        >
                           <Checkbox
  checked={isComplete}
  size="small"
  disabled={!progressLoaded || savingLessonId === lesson.id}
  onClick={(event) => event.stopPropagation()}
  onChange={() => toggleComplete(lesson.id)}
  slotProps={{
    input: {
      "aria-label": `Mark ${lesson.title} as complete`,
    },
  }}
  sx={{
    p: 0,
    color: theme.palette.text.disabled,
    "&.Mui-checked": {
      color: theme.palette.success.main,
    },
  }}
/>
                          <Button
                            type="button"
                            onClick={() => setActiveLessonId(lesson.id)}
                            aria-current={isActive ? "step" : undefined}
                            startIcon={
                              <CirclePlay
                                size={17}
                                color={isActive ? theme.palette.primary.main : theme.palette.text.disabled}
                              />
                            }
                            sx={{
                              flex: 1,
                              justifyContent: "flex-start",
                              minWidth: 0,
                              px: 0,
                              py: 0,
                              color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                              fontWeight: isActive ? 700 : 500,
                              lineHeight: 1.5,
                              textAlign: "left",
                              textTransform: "none",
                              "& .MuiButton-startIcon": { mr: 1.25 },
                            }}
                          >
                            {lesson.title}
                          </Button>

                          {isComplete && (
                            <CheckCircle2
                              size={16}
                              color={theme.palette.success.main}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>

          {course.duration && (
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Clock3 size={16} color={theme.palette.text.secondary} />
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Course duration: {course.duration}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
