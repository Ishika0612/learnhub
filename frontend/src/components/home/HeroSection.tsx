"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import {
  ArrowRight,
  Play,
  BookOpen,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import theme from "@/theme";

export default function HeroSection() {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Decorative shapes */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          top: 70,
          right: "8%",
          width: 90,
          height: 90,
          border: `1px solid ${theme.palette.accent.main}33`,
          borderRadius: "28px",
          transform: "rotate(18deg)",
          display: { xs: "none", md: "block" },
        }}
      />

      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.05fr 0.95fr",
            },
            alignItems: "center",
            gap: { xs: 5, md: 7 },
            py: { xs: 8, md: 12 },
          }}
        >
          {/* Left Content */}
          <Box sx={{ maxWidth: 620 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.8,
                mb: 3,
                bgcolor: theme.palette.secondary.light,
                border: `1px solid ${theme.palette.secondary.light}`,
                borderRadius: 50,
              }}
            >
              <Sparkles size={16} color={theme.palette.secondary.main} />

              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 750,
                  color: theme.palette.secondary.dark,
                }}
              >
                YOUR NEXT CHAPTER STARTS HERE
              </Typography>
            </Box>

            <Typography
              component="h1"
              sx={{
                fontSize: {
                  xs: 39,
                  sm: 52,
                  md: 60,
                  lg: 68,
                },
                lineHeight: 1.08,
                letterSpacing: "-2.5px",
                fontWeight: 850,
                color: theme.palette.text.primary,
                mb: 2.5,
              }}
            >
              Learn skills.
              <br />
              Build your{" "}
              <Box
                component="span"
                sx={{
                  color: theme.palette.secondary.main,
                  position: "relative",
                  display: "inline-block",
                }}
              >
                future.
              </Box>
            </Typography>

            <Typography
              sx={{
                maxWidth: 510,
                fontSize: { xs: 15, md: 17 },
                lineHeight: 1.85,
                color: theme.palette.text.secondary,
                mb: 4,
              }}
            >
              Discover practical courses, learn from industry experts, and
              turn your curiosity into skills that move your career forward.
            </Typography>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1.5,
                mb: 5,
              }}
            >
              <Button
                component="a"
                href="/courses"
                variant="contained"
                endIcon={<ArrowRight size={18} />}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2.5,
                  bgcolor: theme.palette.primary.main,
                  fontSize: 14,
                  fontWeight: 750,
                  textTransform: "none",
                  boxShadow: `0 8px 20px ${theme.palette.primary.main}2e`,
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                    boxShadow: `0 10px 24px ${theme.palette.primary.main}3d`,
                  },
                }}
              >
                Explore courses
              </Button>

              <Button
                component="a"
                href="#how-it-works"
                variant="outlined"
                startIcon={<Play size={17} />}
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 2.5,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  bgcolor: theme.palette.background.paper,
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: theme.palette.background.default,
                  },
                }}
              >
                How it works
              </Button>
            </Box>

          </Box>

          {/* Right Visual */}
          <Box
            sx={{
              position: "relative",
              maxWidth: 560,
              width: "100%",
              mx: "auto",
            }}
          >
            {/* Main image panel */}
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: { xs: 4, md: 6 },
                minHeight: { xs: 320, sm: 400, md: 470 },
                background: `linear-gradient(145deg, ${theme.palette.primary.light} 0%, ${theme.palette.accent.light} 48%, ${theme.palette.secondary.light} 100%)`,
                border: `1px solid ${theme.palette.common.white}e6`,
                boxShadow: `0 30px 70px ${theme.palette.primary.main}1f`,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(180deg, ${theme.palette.primary.dark}05 35%, ${theme.palette.primary.dark}a6 100%)`,
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  left: { xs: 18, sm: 26 },
                  right: { xs: 18, sm: 26 },
                  bottom: { xs: 18, sm: 26 },
                  color: theme.palette.common.white,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 750,
                    letterSpacing: 1.5,
                    mb: 1,
                    color: theme.palette.accent.light,
                  }}
                >
                  LEARN WITHOUT LIMITS
                </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: 23, sm: 30 },
                    fontWeight: 800,
                    letterSpacing: "-0.8px",
                    lineHeight: 1.2,
                    maxWidth: 370,
                  }}
                >
                  Small steps today. Big possibilities tomorrow.
                </Typography>
              </Box>
            </Box>

            {/* Floating course card */}
            <Box
              sx={{
                position: "absolute",
                top: { xs: 16, sm: 35 },
                left: { xs: -5, sm: -28 },
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                boxShadow: `0 12px 35px ${theme.palette.primary.main}1f`,
              }}
            >
              <Box
                sx={{
                  width: 43,
                  height: 43,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 2,
                  bgcolor: theme.palette.secondary.light,
                  color: theme.palette.secondary.dark,
                }}
              >
                <BookOpen size={22} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: theme.palette.text.primary,
                  }}
                >
                  Keep learning
                </Typography>

                <Typography sx={{ fontSize: 11, color: theme.palette.text.secondary }}>
                  One lesson at a time
                </Typography>
              </Box>
            </Box>

            {/* Bottom badge */}
            <Box
              sx={{
                position: "absolute",
                right: { xs: 12, sm: 25 },
                bottom: { xs: -15, sm: -20 },
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1.3,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                borderRadius: 3,
                boxShadow: `0 10px 25px ${theme.palette.primary.main}38`,
              }}
            >
              <GraduationCap size={22} />

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                  Your growth matters
                </Typography>

                <Typography sx={{ fontSize: 10, opacity: 0.8 }}>
                  Start learning today
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
