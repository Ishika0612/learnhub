
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowLeft, Save } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { BackendCourse } from "@/lib/courseApi";

type CourseFormData = {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  price: string;
  thumbnail_url: string;
};

type EditCourseFormProps = {
  courseId: string;
};

const emptyForm: CourseFormData = {
  title: "",
  subtitle: "",
  description: "",
  category: "",
  level: "Beginner",
  price: "0",
  thumbnail_url: "",
};

export default function EditCourseForm({
  courseId,
}: EditCourseFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<CourseFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCourse() {
      try {
        setLoading(true);
        setError("");

        const course = await apiRequest<BackendCourse>(
          `/courses/${encodeURIComponent(courseId)}`
        );

        if (!active) return;

        setForm({
          title: course.title ?? "",
          subtitle: course.subtitle ?? "",
          description: course.description ?? "",
          category: course.category ?? "",
          level: course.level ?? "Beginner",
          price: String(course.price ?? 0),
          thumbnail_url: course.thumbnail_url ?? "",
        });
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load course details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCourse();

    return () => {
      active = false;
    };
  }, [courseId]);

  function handleChange(
    field: keyof CourseFormData,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid, non-negative price.");
      return;
    }

    try {
      setSaving(true);

      await apiRequest(`/courses/${encodeURIComponent(courseId)}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || null,
          description: form.description.trim(),
          category: form.category.trim(),
          level: form.level,
          price,
          thumbnail_url: form.thumbnail_url.trim() || null,
        }),
      });

      setSuccess("Course updated successfully.");
      router.replace("/instructor/courses");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the course."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 250,
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error && !form.title) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => router.push("/instructor/courses")}
          sx={{ alignSelf: "flex-start" }}
        >
          Back to courses
        </Button>
      </Stack>
    );
  }

  return (
    <Box sx={{ maxWidth: 850, mx: "auto", py: 3 }}>
      <Button
        startIcon={<ArrowLeft size={18} />}
        onClick={() => router.push("/instructor/courses")}
        sx={{ mb: 2, textTransform: "none" }}
      >
        Back to courses
      </Button>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Edit Course
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Update your course information and save your changes.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: { xs: 2, sm: 3 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            label="Course Title"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Subtitle"
            value={form.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
            fullWidth
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            required
            multiline
            minRows={4}
            fullWidth
          />

          <TextField
            label="Category"
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            required
            fullWidth
            placeholder="e.g. Web Development"
          />

          <TextField
            select
            label="Level"
            value={form.level}
            onChange={(e) => handleChange("level", e.target.value)}
            required
            fullWidth
          >
            {["Beginner", "Intermediate", "Advanced"].map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Price"
            type="number"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            slotProps={{
              htmlInput: { min: 0, step: "0.01" },
            }}
            required
            fullWidth
          />

          <TextField
            label="Thumbnail Image URL"
            type="url"
            value={form.thumbnail_url}
            onChange={(e) =>
              handleChange("thumbnail_url", e.target.value)
            }
            fullWidth
            placeholder="https://example.com/course-image.jpg"
          />

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Save size={18} />
              )
            }
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              bgcolor: "#001F54",
              "&:hover": { bgcolor: "#003078" },
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
