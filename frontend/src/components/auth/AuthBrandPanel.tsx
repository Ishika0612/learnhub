"use client";

import { Box, Typography, useTheme } from "@mui/material";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";

export default function AuthBrandPanel() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100%",
        p: { md: 5, lg: 7 },
        bgcolor: theme.palette.primary.main,
        color: theme.palette.common.white,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            bgcolor: theme.palette.common.white,
            color: theme.palette.primary.main,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
          }}
        >
          <GraduationCap size={26} />
        </Box>
        <Typography sx={{ fontWeight: 750, fontSize: 23 }}>
          LearnHub
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 480, py: 5, zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 3,
            color: theme.palette.secondary.light,
          }}
        >
          <Sparkles size={18} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            YOUR LEARNING JOURNEY STARTS HERE
          </Typography>
        </Box>

        <Typography
          component="h1"
          sx={{
            fontSize: { md: 38, lg: 52 },
            lineHeight: 1.15,
            fontWeight: 750,
            letterSpacing: -1.5,
            mb: 2.5,
          }}
        >
          Learn new skills.
          <br />
          Build your future.
        </Typography>

        <Typography
          sx={{
            color: theme.palette.primary.contrastText,
            fontSize: 16,
            lineHeight: 1.9,
            mb: 4,
          }}
        >
          Discover expert-led courses, learn at your own
          pace, and turn your ambitions into real skills.
        </Typography>

        <Box
          sx={{
            p: 2.5,
            border: `1px solid ${theme.palette.common.white}2e`,
            bgcolor: `${theme.palette.common.white}12`,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <BookOpen size={30} color={theme.palette.secondary.light} />
          <Box>
            <Typography sx={{ fontWeight: 650 }}>
              Your next chapter begins today
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.primary.contrastText, mt: 0.5 }}
            >
              Learn something new, every day.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Typography variant="caption" sx={{ color: theme.palette.secondary.light }}>
        LearnHub. Learn at your own pace.
      </Typography>
    </Box>
  );
}
