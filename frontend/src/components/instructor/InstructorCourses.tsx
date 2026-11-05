
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Plus, RefreshCw } from "lucide-react";
import theme from "@/theme";
import { apiRequest } from "@/lib/api";

import InstructorCourseCard, {
  type InstructorCourse,
} from "./InstructorCourseCard";

export default function InstructorCourses() {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = useCallback(() => {
    return apiRequest<InstructorCourse[]>("/courses/instructor/my-courses", {
      cache: "no-store",
    });
  }, []);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setCourses(await fetchCourses());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  useEffect(() => {
    let active = true;
    fetchCourses()
      .then((result) => {
        if (active) setCourses(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Something went wrong.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchCourses]);

  const filteredCourses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesStatus =
        filter === "ALL" || course.status.toUpperCase() === filter;
      const matchesQuery =
        !search ||
        [course.title, course.category, course.level, course.subtitle ?? ""]
          .some((value) => value.toLowerCase().includes(search));
      return matchesStatus && matchesQuery;
    });
  }, [courses, filter, query]);

  const statusCounts = [
    { label: "All", value: "ALL", count: courses.length },
    {
      label: "Approved",
      value: "APPROVED",
      count: courses.filter((course) => course.status === "APPROVED").length,
    },
    {
      label: "Pending",
      value: "PENDING",
      count: courses.filter((course) => course.status === "PENDING").length,
    },
    {
      label: "Needs changes",
      value: "REJECTED",
      count: courses.filter((course) => course.status === "REJECTED").length,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Stack
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            My Courses
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Manage your courses and monitor their approval status.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={17} />}
            onClick={() => void loadCourses()}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            component="a"
            href="/instructor/courses/create"
            variant="contained"
            startIcon={<Plus size={17} />}
          >
            Create Course
          </Button>
        </Stack>
      </Stack>

      <Stack
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {statusCounts.map((status) => (
            <Chip
              key={status.value}
              clickable
              onClick={() => setFilter(status.value)}
              label={`${status.label} · ${status.count}`}
              color={filter === status.value ? "primary" : "default"}
              variant={filter === status.value ? "filled" : "outlined"}
              aria-pressed={filter === status.value}
            />
          ))}
        </Box>
        <Typography color="text.secondary" variant="body2">
          Showing {filteredCourses.length} of {courses.length} courses
        </Typography>
        <TextField
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search your courses"
          slotProps={{ htmlInput: { "aria-label": "Search your courses" } }}
          sx={{ minWidth: { sm: 260 }, bgcolor: theme.palette.background.paper }}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredCourses.length === 0 ? (
        <Box
          sx={{
            py: 7,
            textAlign: "center",
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {courses.length === 0
              ? "You haven't created any courses yet"
              : "No courses match your filters"}
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {courses.length === 0
              ? "Create a course to start sharing your knowledge."
              : "Try another status or search term."}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filteredCourses.map((course) => (
            <Grid
              key={course.id}
              size={{ xs: 12, sm: 6, md: 4 }}
            >
              <InstructorCourseCard course={course} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
