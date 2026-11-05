"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import {
  ApiRequestError,
  apiRequest,
  getAccessToken,
  type ApiUser,
} from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminStats from "@/components/admin/AdminStats";
import ApplicationDecisionDialog from "@/components/admin/ApplicationDecisionDialog";
import InstructorApplicationsTable from "@/components/admin/InstructorApplicationsTable";
import {
  decideInstructorApplication,
  getInstructorApplications,
  type InstructorApplication,
} from "@/lib/admin";
import type { BackendCourse } from "@/lib/courseApi";

type InstructorStats = {
  total_courses: number;
  approved_courses: number;
  pending_courses: number;
  rejected_courses: number;
  total_enrollments: number;
  average_progress: number;
};

type CourseDraft = {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  price: string;
  thumbnail_url: string;
};

const emptyDraft: CourseDraft = {
  title: "",
  subtitle: "",
  description: "",
  category: "",
  level: "Beginner",
  price: "0",
  thumbnail_url: "",
};

export default function RoleDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [pendingCourses, setPendingCourses] = useState<BackendCourse[]>([]);
  const [pendingInstructors, setPendingInstructors] = useState<
    InstructorApplication[]
  >([]);
  const [draft, setDraft] = useState<CourseDraft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [instructorQueueError, setInstructorQueueError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshingAdminQueues, setRefreshingAdminQueues] = useState(false);
  const [decisionApplication, setDecisionApplication] =
    useState<InstructorApplication | null>(null);
  const [instructorDecision, setInstructorDecision] = useState<
    "approved" | "rejected"
  >("approved");
  const [rejectionReasons, setRejectionReasons] = useState<
    Record<number, string>
  >({});
  const [reviewingCourseIds, setReviewingCourseIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [reviewingInstructorIds, setReviewingInstructorIds] = useState<
    Set<number>
  >(() => new Set());
  const reviewingCourseIdsRef = useRef(new Set<number>());
  const reviewingInstructorIdsRef = useRef(new Set<number>());

  const refreshAdminQueues = useCallback(async () => {
    setRefreshingAdminQueues(true);
    setInstructorQueueError("");
    const [coursesResult, instructorsResult] = await Promise.allSettled([
      apiRequest<BackendCourse[]>("/admin/courses"),
      getInstructorApplications(),
    ]);

    const queueErrors: string[] = [];
    if (coursesResult.status === "fulfilled") {
      setPendingCourses(coursesResult.value);
    } else {
      queueErrors.push(
        `Could not load pending courses: ${
          coursesResult.reason instanceof Error
            ? coursesResult.reason.message
            : "Please try again."
        }`,
      );
    }

    if (instructorsResult.status === "fulfilled") {
      setPendingInstructors(instructorsResult.value);
    } else {
      const message =
        instructorsResult.reason instanceof Error
          ? instructorsResult.reason.message
          : "Please try again.";
      setInstructorQueueError(message);
    }

    setError(queueErrors.join(" "));
    setRefreshingAdminQueues(false);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      let redirecting = false;
      try {
        if (!getAccessToken()) {
          redirecting = true;
          router.replace("/login?redirect=%2Fdashboard");
          return;
        }

        const currentUser = await apiRequest<ApiUser>("/auth/me");
        if (!active) return;

        if (currentUser.role === "instructor") {
          setUser(currentUser);
          const data = await apiRequest<InstructorStats>(
            "/dashboard/instructor",
          );
          if (active) setStats(data);
        } else if (currentUser.role === "admin") {
          redirecting = true;
          router.replace("/admin");
        } else {
          redirecting = true;
          router.replace("/student");
        }
      } catch (cause) {
        if (active) {
          if (cause instanceof ApiRequestError && cause.status === 401) {
            clearAccessToken();
            redirecting = true;
            router.replace("/login?redirect=%2Fdashboard");
            return;
          }
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load your dashboard.",
          );
        }
      } finally {
        if (active && !redirecting) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [refreshAdminQueues, router]);

  async function submitCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await apiRequest<BackendCourse>("/courses/", {
        method: "POST",
        body: JSON.stringify({
          title: draft.title.trim(),
          subtitle: draft.subtitle.trim() || null,
          description: draft.description.trim(),
          category: draft.category.trim(),
          level: draft.level.trim(),
          price: Number(draft.price),
          thumbnail_url: draft.thumbnail_url.trim() || null,
        }),
      });
      setDraft(emptyDraft);
      setNotice("Course submitted. It will be listed after admin approval.");
      const updatedStats = await apiRequest<InstructorStats>(
        "/dashboard/instructor",
      );
      setStats(updatedStats);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not submit the course.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function reviewCourse(courseId: number, decision: "approve" | "reject") {
    if (reviewingCourseIdsRef.current.has(courseId)) return;
    reviewingCourseIdsRef.current.add(courseId);
    setReviewingCourseIds((ids) => new Set(ids).add(courseId));
    setError("");
    setNotice("");
    try {
      await apiRequest<BackendCourse>(
        `/admin/courses/${courseId}/${decision}`,
        {
          method: "PATCH",
          ...(decision === "reject"
            ? {
                body: JSON.stringify({
                  rejection_reason: rejectionReasons[courseId]?.trim() ?? "",
                }),
              }
            : {}),
        },
      );
      setPendingCourses((courses) =>
        courses.filter((course) => course.id !== courseId),
      );
      setNotice(
        decision === "approve"
          ? "Course approved and published."
          : "Course rejected and returned to the instructor.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : `Could not ${decision} this course.`,
      );
    } finally {
      reviewingCourseIdsRef.current.delete(courseId);
      setReviewingCourseIds((ids) => {
        const updatedIds = new Set(ids);
        updatedIds.delete(courseId);
        return updatedIds;
      });
    }
  }

  async function reviewInstructor(
    instructorId: number,
    decision: "approved" | "rejected",
    rejectionReason = "",
  ): Promise<boolean> {
    if (reviewingInstructorIdsRef.current.has(instructorId)) return false;
    reviewingInstructorIdsRef.current.add(instructorId);
    setReviewingInstructorIds((ids) => new Set(ids).add(instructorId));
    setError("");
    setNotice("");
    try {
      await decideInstructorApplication(
        instructorId,
        decision,
        rejectionReason,
      );
      setPendingInstructors((applications) =>
        applications.filter((application) => application.id !== instructorId),
      );
      setNotice(
        decision === "approved"
          ? "Instructor application approved."
          : "Instructor application rejected.",
      );
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : `Could not ${
              decision === "approved" ? "approve" : "reject"
            } this instructor application.`,
      );
      return false;
    } finally {
      reviewingInstructorIdsRef.current.delete(instructorId);
      setReviewingInstructorIds((ids) => {
        const updatedIds = new Set(ids);
        updatedIds.delete(instructorId);
        return updatedIds;
      });
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 7 } }}>
        <Alert severity="error">
          {error || "Your account could not be loaded. Please sign in again."}
        </Alert>
        <Button
          href="/login?redirect=%2Fdashboard"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Sign in
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        {user?.role === "admin" ? "Admin dashboard" : "Instructor dashboard"}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Signed in as {user?.full_name} ({user?.email})
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}

      {user?.role === "instructor" && (
        <Box sx={{ display: "grid", gap: 3 }}>
          {stats && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {[
                ["Courses", stats.total_courses],
                ["Awaiting approval", stats.pending_courses],
                ["Approved", stats.approved_courses],
                ["Rejected", stats.rejected_courses],
                ["Enrollments", stats.total_enrollments],
                ["Average progress", `${stats.average_progress}%`],
              ].map(([label, value]) => (
                <Card key={label} variant="outlined">
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {value}
                    </Typography>
                    <Typography color="text.secondary">{label}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          <Card variant="outlined">
            <CardContent>
              <Typography component="h2" variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
                Submit a course for review
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Submitted courses remain unpublished until an administrator
                approves them. The backend currently reviews courses as a whole;
                it does not provide separate video approval.
              </Alert>
              <Box
                component="form"
                onSubmit={submitCourse}
                sx={{ display: "grid", gap: 2 }}
              >
                <TextField
                  label="Course title"
                  required
                  value={draft.title}
                  onChange={(event) =>
                    setDraft({ ...draft, title: event.target.value })
                  }
                />
                <TextField
                  label="Short description"
                  value={draft.subtitle}
                  onChange={(event) =>
                    setDraft({ ...draft, subtitle: event.target.value })
                  }
                />
                <TextField
                  label="Full description"
                  required
                  multiline
                  minRows={3}
                  value={draft.description}
                  onChange={(event) =>
                    setDraft({ ...draft, description: event.target.value })
                  }
                />
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Category"
                    required
                    value={draft.category}
                    onChange={(event) =>
                      setDraft({ ...draft, category: event.target.value })
                    }
                  />
                  <TextField
                    label="Level"
                    value={draft.level}
                    onChange={(event) =>
                      setDraft({ ...draft, level: event.target.value })
                    }
                  />
                  <TextField
                    label="Price"
                    type="number"
                    required
                    slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                    value={draft.price}
                    onChange={(event) =>
                      setDraft({ ...draft, price: event.target.value })
                    }
                  />
                </Box>
                <TextField
                  label="Thumbnail image URL"
                  type="url"
                  value={draft.thumbnail_url}
                  onChange={(event) =>
                    setDraft({ ...draft, thumbnail_url: event.target.value })
                  }
                />
                <Button type="submit" variant="contained" disabled={saving}>
                  {saving ? "Submitting..." : "Submit for approval"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {user?.role === "admin" && (
        <Box sx={{ display: "grid", gap: 2 }}>
          <AdminHeader
            onRefresh={() => void refreshAdminQueues()}
            loading={refreshingAdminQueues}
          />
          <AdminStats
            pendingCount={pendingInstructors.length}
            loading={refreshingAdminQueues}
          />
          <InstructorApplicationsTable
            applications={pendingInstructors}
            loading={refreshingAdminQueues}
            error={instructorQueueError}
            saving={reviewingInstructorIds.size > 0}
            onApprove={(application) => {
              setInstructorDecision("approved");
              setDecisionApplication(application);
            }}
            onReject={(application) => {
              setInstructorDecision("rejected");
              setDecisionApplication(application);
            }}
          />

          <Typography component="h2" variant="h6" sx={{ fontWeight: 750 }}>
            Courses awaiting approval ({pendingCourses.length})
          </Typography>
          {pendingCourses.length === 0 ? (
            <Typography color="text.secondary">
              There are no courses waiting for review.
            </Typography>
          ) : (
            pendingCourses.map((course) => (
              <Card key={course.id} variant="outlined">
                <CardContent sx={{ display: "grid", gap: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 750 }}>
                    {course.title}
                  </Typography>
                  <Typography color="text.secondary">
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                      <Avatar
                        src={course.instructor_profile_picture_url ?? undefined}
                        alt={course.instructor_name ?? "Instructor"}
                        sx={{ width: 22, height: 22, fontSize: 12 }}
                      >
                        {course.instructor_name?.charAt(0).toUpperCase() ?? "I"}
                      </Avatar>
                      {course.instructor_name ?? "Instructor"}
                    </Box>
                    {" · "}{course.category} ·{" "}
                    {course.level}
                  </Typography>
                  <Typography>{course.description}</Typography>
                  <TextField
                    label="Rejection reason (required to reject)"
                    value={rejectionReasons[course.id] ?? ""}
                    slotProps={{ htmlInput: { maxLength: 1000 } }}
                    onChange={(event) =>
                      setRejectionReasons((reasons) => ({
                        ...reasons,
                        [course.id]: event.target.value,
                      }))
                    }
                    disabled={reviewingCourseIds.has(course.id)}
                  />
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      disabled={reviewingCourseIds.has(course.id)}
                      onClick={() => void reviewCourse(course.id, "approve")}
                    >
                      {reviewingCourseIds.has(course.id)
                        ? "Saving..."
                        : "Approve course"}
                    </Button>
                    <Button
                      color="error"
                      variant="outlined"
                      disabled={
                        reviewingCourseIds.has(course.id) ||
                        !rejectionReasons[course.id]?.trim()
                      }
                      onClick={() => void reviewCourse(course.id, "reject")}
                    >
                      Reject course
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}
      <ApplicationDecisionDialog
        application={decisionApplication}
        decision={instructorDecision}
        saving={
          decisionApplication !== null &&
          reviewingInstructorIds.has(decisionApplication.id)
        }
        onClose={() => setDecisionApplication(null)}
        onConfirm={(reason) => {
          if (!decisionApplication) return;
          void reviewInstructor(
            decisionApplication.id,
            instructorDecision,
            reason,
          ).then((succeeded) => {
            if (succeeded) setDecisionApplication(null);
          });
        }}
      />
    </Container>
  );
}
