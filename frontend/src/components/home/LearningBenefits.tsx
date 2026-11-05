
"use client";

import { motion } from "motion/react";
import {
  BookOpenCheck,
  GraduationCap,
  Clock3,
  Trophy,
  Users,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { Box, Container, Typography } from "@mui/material";
import theme from "@/theme";

const MotionBox = motion.create(Box);

const benefits = [
  {
    icon: GraduationCap,
    title: "Learn from experts",
    description:
      "Gain practical knowledge from experienced instructors who understand the industry.",
    color: theme.palette.secondary.main,
    background: theme.palette.secondary.light,
  },
  {
    icon: Clock3,
    title: "Learn on your schedule",
    description:
      "Study at your own pace and revisit lessons whenever you need a refresher.",
    color: theme.palette.info.main,
    background: theme.palette.info.light,
  },
  {
    icon: BookOpenCheck,
    title: "Practical projects",
    description:
      "Apply what you learn through hands-on exercises and portfolio-ready projects.",
    color: theme.palette.success.main,
    background: theme.palette.success.light,
  },
  {
    icon: Trophy,
    title: "Track your progress",
    description:
      "Stay motivated with learning milestones and a clear view of your progress.",
    color: theme.palette.warning.main,
    background: theme.palette.warning.light,
  },
  {
    icon: Users,
    title: "Join a learning community",
    description:
      "Share ideas, ask questions, and learn alongside people with similar goals.",
    color: theme.palette.error.main,
    background: theme.palette.error.light,
  },
  {
    icon: ShieldCheck,
    title: "Learn with confidence",
    description:
      "Follow structured learning paths designed to help you build skills step by step.",
    color: theme.palette.success.dark,
    background: theme.palette.success.light,
  },
];

export default function LearningBenefits() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 11 },
        bgcolor: theme.palette.background.default,
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.85fr 1.15fr" },
            gap: { xs: 5, md: 8 },
            alignItems: "center",
          }}
        >
          {/* Left content */}
          <MotionBox
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
          >
            <Typography
              sx={{
                color: theme.palette.accent.main,
                fontWeight: 800,
                fontSize: 11,
                letterSpacing: 1.8,
                mb: 2,
              }}
            >
              THE LEARNHUB EXPERIENCE
            </Typography>

            <Typography
              variant="h2"
              sx={{
                color: theme.palette.primary.main,
                fontSize: { xs: "2rem", md: "2.8rem" },
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "-1.2px",
              }}
            >
              More than courses.
              <Box component="span" sx={{ color: theme.palette.secondary.main }}>
                {" "}
                A path to growth.
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: 2.5,
                color: theme.palette.text.secondary,
                fontSize: 14,
                lineHeight: 1.9,
                maxWidth: 440,
              }}
            >
              Learning should help you do more than finish a lesson. Build
              useful skills, practice what matters, and keep moving toward your
              goals with LearnHub.
            </Typography>

            <Box
              sx={{
                mt: 4,
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderRadius: 3,
                bgcolor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: theme.palette.secondary.light,
                  color: theme.palette.secondary.dark,
                  borderRadius: 2.5,
                }}
              >
                <BookOpenCheck size={23} />
              </Box>

              <Box>
                <Typography
                  sx={{ color: theme.palette.primary.main, fontSize: 14, fontWeight: 800 }}
                >
                  Your next skill starts here
                </Typography>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12, mt: 0.4 }}>
                  Learn something useful, one lesson at a time.
                </Typography>
              </Box>
            </Box>
          </MotionBox>

          {/* Benefit cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <MotionBox
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.4,
                    delay: (index % 2) * 0.1,
                  }}
                  whileHover={{ y: -5 }}
                  sx={{
                    p: 2.5,
                    minHeight: 180,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    bgcolor: theme.palette.background.paper,
                    transition: "box-shadow .25s ease, border-color .25s ease",
                    "&:hover": {
                      borderColor: `${benefit.color}55`,
                      boxShadow: `0 12px 30px ${theme.palette.primary.main}0d`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: benefit.background,
                      color: benefit.color,
                      borderRadius: 2.5,
                      mb: 2,
                      transition: "transform .25s ease",
                      "&:hover": { transform: "rotate(-5deg) scale(1.05)" },
                    }}
                  >
                    <Icon size={22} strokeWidth={1.8} />
                  </Box>

                  <Typography
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 800,
                      fontSize: 14,
                      mb: 1,
                    }}
                  >
                    {benefit.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: 12,
                      lineHeight: 1.8,
                    }}
                  >
                    {benefit.description}
                  </Typography>
                </MotionBox>
              );
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
