"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { RefreshCw, BookOpen } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { BackendCourse } from "@/lib/courseApi";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [busyIds, setBusyIds] = useState<Set<number>>(() => new Set());

  const fetchCourses = useCallback(() => apiRequest<BackendCourse[]>("/admin/courses"), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setCourses(await fetchCourses());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load pending courses.",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  useEffect(() => {
    let active = true;
    fetchCourses()
      .then((data) => {
        if (active) setCourses(data);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Could not load pending courses.");
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
    if (!search) return courses;
    return courses.filter((course) =>
      [
        course.title,
        course.subtitle ?? "",
        course.category,
        course.level,
        course.instructor_name ?? "",
      ].some((value) => value.toLowerCase().includes(search)),
    );
  }, [courses, query]);

  async function reviewCourse(id: number, decision: "approve" | "reject") {
    if (busyIds.has(id)) return;

    const reason = reasons[id]?.trim() ?? "";

    if (decision === "reject" && !reason) {
      setError("Enter a rejection reason before rejecting the course.");
      return;
    }

    setBusyIds((current) => new Set(current).add(id));
    setError("");
    setNotice("");

    try {
      await apiRequest<BackendCourse>(`/admin/courses/${id}/${decision}`, {
        method: "PATCH",
        ...(decision === "reject"
          ? { body: JSON.stringify({ rejection_reason: reason }) }
          : {}),
      });

      setCourses((current) => current.filter((course) => course.id !== id));
      setNotice(
        decision === "approve"
          ? "Course approved successfully."
          : "Course rejected successfully.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not review this course.",
      );
    } finally {
      setBusyIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 850, color: "#172b4d" }}
          >
            Course management
          </Typography>
          <Typography sx={{ color: "#758195", mt: 0.75, fontSize: 14 }}>
            Review instructor submissions before publishing them.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshCw size={16} />}
          onClick={() => void refresh()}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Refresh
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Chip
          icon={<BookOpen size={15} />}
          label={`${loading ? "—" : courses.length} pending`}
          sx={{ bgcolor: "#edf3ff", color: "#173b73", fontWeight: 750 }}
        />
        <Typography sx={{ color: "#758195", fontSize: 13 }}>
          Only approve courses that meet your platform&apos;s quality requirements.
        </Typography>
        <TextField
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, category, instructor ID"
          slotProps={{ htmlInput: { "aria-label": "Search pending courses" } }}
          sx={{ ml: { sm: "auto" }, width: { xs: "100%", sm: 300 }, bgcolor: "#fff" }}
        />
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {notice && <Alert severity="success">{notice}</Alert>}

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredCourses.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#e2e8f0" }}>
          <CardContent sx={{ py: 7, textAlign: "center" }}>
            <BookOpen size={34} color="#98a2b3" />
            <Typography sx={{ mt: 2, fontWeight: 800, color: "#344563" }}>
              {courses.length === 0
                ? "No courses awaiting review"
                : "No pending courses match your search"}
            </Typography>
            <Typography sx={{ mt: 0.75, color: "#758195", fontSize: 13 }}>
              {courses.length === 0
                ? "New course submissions will appear here."
                : "Try searching by course title, category, or instructor."}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          {filteredCourses.map((course) => {
            const busy = busyIds.has(course.id);

            return (
              <Card
                key={course.id}
                variant="outlined"
                sx={{ borderRadius: 3, borderColor: "#e2e8f0" }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        component="h2"
                        sx={{ fontSize: 18, fontWeight: 800, color: "#172b4d" }}
                      >
                        {course.title}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1 }}>
                        <Avatar
                          src={course.instructor_profile_picture_url ?? undefined}
                          alt={course.instructor_name ?? "Instructor"}
                          sx={{ width: 24, height: 24, fontSize: 12 }}
                        >
                          {course.instructor_name?.charAt(0).toUpperCase() ?? "I"}
                        </Avatar>
                        <Typography sx={{ fontSize: 12, color: "#758195" }}>
                          {course.instructor_name ?? "Instructor"}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
                        <Chip size="small" label={course.category} />
                        <Chip size="small" label={course.level} />
                        <Chip
                          size="small"
                          label="Pending review"
                          sx={{ bgcolor: "#fff4db", color: "#8a5a00" }}
                        />
                      </Box>
                    </Box>

                    <Typography
                      sx={{ fontWeight: 800, fontSize: 17, color: "#172b4d" }}
                    >
                      {Number(course.price).toLocaleString(undefined, {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      color: "#667085",
                      fontSize: 14,
                      lineHeight: 1.8,
                      mt: 2,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {course.description}
                  </Typography>

                  <TextField
                    fullWidth
                    label="Rejection reason"
                    placeholder="Explain what the instructor needs to change"
                    value={reasons[course.id] ?? ""}
                    onChange={(event) =>
                      setReasons((current) => ({
                        ...current,
                        [course.id]: event.target.value.slice(0, 1000),
                      }))
                    }
                    disabled={busy}
                    slotProps={{ htmlInput: { maxLength: 1000 } }}
                    sx={{ mt: 2.5 }}
                    helperText="Required when rejecting a course."
                  />

                  <Box sx={{ display: "flex", gap: 1.5, mt: 2, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      disabled={busy}
                      onClick={() => void reviewCourse(course.id, "approve")}
                      sx={{
                        bgcolor: "#001F54",
                        textTransform: "none",
                        "&:hover": { bgcolor: "#12366b" },
                      }}
                    >
                      {busy ? "Saving..." : "Approve course"}
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      disabled={busy || !reasons[course.id]?.trim()}
                      onClick={() => void reviewCourse(course.id, "reject")}
                      sx={{ textTransform: "none" }}
                    >
                      Reject course
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}