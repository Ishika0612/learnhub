"use client";

import { useState } from "react";
import { Box, Button, Snackbar, Tooltip, Typography } from "@mui/material";
import { Check, Copy, Share2 } from "lucide-react";
import theme from "@/theme";
import type { Course } from "../../../lib/CoursesData";

type CourseShareProps = {
  course: Course;
};

export default function CourseShare({ course }: CourseShareProps) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCopyLink() {
    try {
      const url = new URL(
        `/courses/${course.id}`,
        window.location.origin
      ).toString();

      await navigator.clipboard.writeText(url);
      setCopied(true);
      setMessage("Course link copied to clipboard!");
    } catch {
      setCopied(false);
      setMessage("Unable to copy automatically. Please copy the page URL.");
    }
  }

  async function handleShare() {
    const url = new URL(
      `/courses/${course.id}`,
      window.location.origin
    ).toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: course.title,
          text: `Check out this course on LearnHub: ${course.title}`,
          url,
        });
      } catch {
        // Sharing was cancelled or unavailable.
      }
      return;
    }

    await handleCopyLink();
  }

  return (
    <Box
      sx={{
        mt: 3,
        p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        bgcolor: theme.palette.background.paper,
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
      }}
    >
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 0.5 }}
        >
          Know someone who would love this course?
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Share it with friends and fellow learners.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Tooltip title={copied ? "Link copied" : "Copy course link"}>
          <Button
            variant="outlined"
            startIcon={copied ? <Check size={16} /> : <Copy size={16} />}
            onClick={handleCopyLink}
            sx={{
              textTransform: "none",
              borderColor: theme.palette.divider,
              color: theme.palette.primary.main,
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            {copied ? "Copied" : "Copy link"}
          </Button>
        </Tooltip>

        <Button
          variant="contained"
          startIcon={<Share2 size={16} />}
          onClick={handleShare}
          sx={{
            textTransform: "none",
            bgcolor: theme.palette.primary.main,
            fontWeight: 700,
            borderRadius: 2,
            "&:hover": { bgcolor: theme.palette.primary.light },
          }}
        >
          Share course
        </Button>
      </Box>

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3000}
        onClose={() => setMessage("")}
        message={message}
      />
    </Box>
  );
}