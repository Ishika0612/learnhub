
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";

import CoursesHero from "./CourseHero";
import CourseFilters from "./CourseFilters";
import CoursesGrid from "./CoursesGrid";
import CoursesCTA from "./CoursesCTA";
import type { Course } from "../../lib/CoursesData";
import {
  getApprovedCourses,
  getMyEnrolledCourseIds,
} from "@/lib/courseApi";

export default function CoursePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isStudentWorkspace = pathname.startsWith("/student/");
  const coursesPath = isStudentWorkspace
    ? "/student/courses"
    : "/courses";

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") ?? "All Courses"
  );
  const [activeLevel, setActiveLevel] = useState("All Levels");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Load approved courses. On the student page, exclude enrolled courses.
  useEffect(() => {
    let active = true;

    async function loadCourses() {
      setLoading(true);
      setLoadError("");

      try {
        const approvedCourses = await getApprovedCourses();

        if (!active) return;

        // Public page: show every approved course.
        if (!isStudentWorkspace) {
          setCourses(approvedCourses);
          return;
        }

        // Student page: fetch the current student's enrollments.
        const enrolledIds = await getMyEnrolledCourseIds();

        if (!active) return;

        const enrolledIdSet = new Set(
          enrolledIds.map((id) => String(id))
        );

        const availableCourses = approvedCourses.filter(
          (course) => !enrolledIdSet.has(String(course.id))
        );

        setCourses(availableCourses);
      } catch (error: unknown) {
        if (active) {
          setCourses([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load courses from the server."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, [isStudentWorkspace]);

  // Filter and sort courses.
  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = courses.filter((course) => {
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.level.toLowerCase().includes(query);

      const matchesCategory =
        activeCategory === "All Courses" ||
        course.category === activeCategory;

      const matchesLevel =
        activeLevel === "All Levels" ||
        course.level === activeLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;

      case "newest":
      default:
        result.sort((a, b) => Number(b.id) - Number(a.id));
        break;
    }

    return result;
  }, [courses, search, activeCategory, activeLevel, sortBy]);

  // Submit search and update the URL.
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    const query = search.trim();

    if (query) {
      params.set("q", query);
    }

    if (activeCategory !== "All Courses") {
      params.set("category", activeCategory);
    }

    const queryString = params.toString();

    router.push(
      queryString ? `${coursesPath}?${queryString}` : coursesPath
    );
  }

  // Reset search, filters, and sorting.
  function clearFilters() {
    setSearch("");
    setActiveCategory("All Courses");
    setActiveLevel("All Levels");
    setSortBy("newest");
    setShowFilters(false);
    router.push(coursesPath);
  }

  const hasFilters =
    search.trim() !== "" ||
    activeCategory !== "All Courses" ||
    activeLevel !== "All Levels";

  const availableCategories = useMemo(
    () => [
      "All Courses",
      ...new Set(courses.map((course) => course.category)),
    ],
    [courses]
  );

  const availableLevels = useMemo(
    () => [
      "All Levels",
      ...new Set(courses.map((course) => course.level)),
    ],
    [courses]
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <CoursesHero
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
      />

      <Container
        maxWidth={false}
        sx={{
          maxWidth: 1600,
          mx: "auto",
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 4, md: 6 },
        }}
      >
        <CourseFilters
          studentWorkspace={isStudentWorkspace}
          categories={availableCategories}
          levels={availableLevels}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeLevel={activeLevel}
          setActiveLevel={setActiveLevel}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onClear={clearFilters}
          hasFilters={hasFilters}
        />

        {loadError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {loadError}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        ) : loadError ? null : filteredCourses.length > 0 ? (
          <CoursesGrid
            courses={filteredCourses}
            studentWorkspace={isStudentWorkspace}
          />
        ) : (
          <Typography
            role="status"
            sx={{ py: 6, textAlign: "center" }}
          >
            {courses.length > 0
              ? "No courses match these filters."
              : isStudentWorkspace
                ? "No new courses available. You may already be enrolled in all available courses."
                : "There are no approved courses available yet."}
          </Typography>
        )}

        <CoursesCTA />
      </Container>
    </Box>
  );
}
