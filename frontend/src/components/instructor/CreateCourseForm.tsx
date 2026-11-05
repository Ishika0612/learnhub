
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowLeft, Send } from "lucide-react";
import { apiRequest } from "@/lib/api";

type CourseFormData = {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  price: string;
  thumbnail_url: string;
};

const initialForm: CourseFormData = {
  title: "",
  subtitle: "",
  description: "",
  category: "",
  level: "Beginner",
  price: "0",
  thumbnail_url: "",
};

export default function CreateCourseForm() {
  const router = useRouter();

  const [form, setForm] = useState<CourseFormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(
    field: keyof CourseFormData,
    value: string,
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price of zero or more.");
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/courses", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || null,
          description: form.description.trim(),
          category: form.category,
          level: form.level,
          price,
          thumbnail_url: form.thumbnail_url.trim() || null,
        }),
      });

      setSuccess("Course created successfully. It is awaiting admin approval.");
      setForm(initialForm);

      window.setTimeout(() => {
        router.push("/instructor/courses");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 850, mx: "auto", py: 5, px: 2 }}>
      <Button
        component="a"
        href="/instructor/courses"
        startIcon={<ArrowLeft size={18} />}
        sx={{ mb: 3 }}
      >
        Back to My Courses
      </Button>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Create a Course
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Add course information. Your course will be reviewed before it
          appears in the public catalogue.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Course Title"
              required
              fullWidth
              slotProps={{
                htmlInput: { maxLength: 200 },
              }}
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />

            <TextField
              label="Subtitle"
              fullWidth
              slotProps={{
                htmlInput: { maxLength: 300 },
              }}
              value={form.subtitle}
              onChange={(event) => updateField("subtitle", event.target.value)}
            />

            <TextField
              label="Course Description"
              required
              fullWidth
              multiline
              minRows={5}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Category"
                required
                fullWidth
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
              >
                <MenuItem value="Web Development">Web Development</MenuItem>
                <MenuItem value="Programming">Programming</MenuItem>
                <MenuItem value="Data Science">Data Science</MenuItem>
                <MenuItem value="UI/UX Design">UI/UX Design</MenuItem>
                <MenuItem value="Cloud Computing">Cloud Computing</MenuItem>
                <MenuItem value="Digital Marketing">Digital Marketing</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
              </TextField>

              <TextField
                select
                label="Difficulty Level"
                required
                fullWidth
                value={form.level}
                onChange={(event) => updateField("level", event.target.value)}
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </TextField>
            </Stack>

            <TextField
              label="Price (₹)"
              type="number"
              required
              fullWidth
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              slotProps={{
                htmlInput: { min: 0, step: "0.01" },
              }}
            />

            <TextField
              label="Thumbnail Image URL"
              type="url"
              fullWidth
              value={form.thumbnail_url}
              onChange={(event) => updateField("thumbnail_url", event.target.value)}
              helperText="Optional. Enter a publicly accessible image URL."
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<Send size={18} />}
              disabled={loading}
              sx={{ alignSelf: "flex-start" }}
            >
              {loading ? "Creating Course..." : "Submit for Approval"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
