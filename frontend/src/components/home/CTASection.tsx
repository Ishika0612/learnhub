"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Box, Button, Container, Typography } from "@mui/material";
import theme from "@/theme";

const benefits = [
  "Learn at your own pace",
  "Expert-led courses",
  "Certificates of completion",
];

export default function CTASection() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 7, md: 11 },
        bgcolor: theme.palette.background.default,
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: { xs: 4, md: 6 },
              background: `linear-gradient(
                120deg,
                ${theme.palette.primary.dark} 0%,
                ${theme.palette.primary.main} 55%,
                ${theme.palette.primary.light} 100%
              )`,
              color: theme.palette.primary.contrastText,
              px: { xs: 3, sm: 5, md: 9 },
              py: { xs: 5, md: 8 },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: { xs: 5, md: 6 },
              isolation: "isolate",

              "&::before": {
                content: '""',
                position: "absolute",
                width: 320,
                height: 320,
                borderRadius: "50%",
                border: `1px solid ${theme.palette.common.white}1f`,
                right: { xs: -120, md: 120 },
                top: -150,
                zIndex: -1,
                pointerEvents: "none",
              },

              "&::after": {
                content: '""',
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: "50%",
                border: `1px solid ${theme.palette.common.white}1a`,
                right: { xs: -70, md: 170 },
                bottom: -130,
                zIndex: -1,
                pointerEvents: "none",
              },
            }}
          >
            {/* Left content */}
            <Box sx={{ maxWidth: 590, width: "100%", zIndex: 1 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                {/* Eyebrow */}
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.7,
                    py: 0.8,
                    mb: 2.5,
                    borderRadius: 20,
                    border: `1px solid ${theme.palette.common.white}33`,
                    bgcolor: `${theme.palette.common.white}14`,
                  }}
                >
                  <Sparkles size={16} color={theme.palette.warning.light} />

                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    YOUR NEXT CHAPTER STARTS HERE
                  </Typography>
                </Box>

                {/* Heading */}
                <Typography
                  component="h2"
                  sx={{
                    fontSize: {
                      xs: "2rem",
                      sm: "2.7rem",
                      md: "3.35rem",
                    },
                    lineHeight: 1.15,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    mb: 2.5,
                    maxWidth: 550,
                  }}
                >
                  Ready to turn your goals into{" "}
                  <Box
                    component="span"
                    sx={{ color: theme.palette.secondary.light }}
                  >
                    real skills?
                  </Box>
                </Typography>

                {/* Description */}
                <Typography
                  sx={{
                    color: theme.palette.secondary.light,
                    lineHeight: 1.8,
                    fontSize: { xs: 0.95, md: 1.05 },
                    maxWidth: 510,
                    mb: 3.5,
                  }}
                >
                  Join a community of learners, explore practical courses, and
                  build the skills you need to move forward with confidence.
                </Typography>

                {/* Benefits */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    mb: 4,
                  }}
                >
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.4,
                        delay: 0.3 + index * 0.12,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.2,
                        }}
                      >
                        <CheckCircle2
                          size={18}
                          color={theme.palette.secondary.light}
                          strokeWidth={2.2}
                        />

                        <Typography
                          sx={{
                            color: theme.palette.primary.contrastText,
                            fontSize: 14,
                          }}
                        >
                          {benefit}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>

                {/* Action buttons */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  <Button
                    component="a"
                    href="/courses"
                    variant="contained"
                    endIcon={<ArrowRight size={18} />}
                    sx={{
                      px: 3,
                      py: 1.35,
                      borderRadius: 2.5,
                      textTransform: "none",
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      bgcolor: theme.palette.background.paper,
                      boxShadow: "none",
                      transition: "all 0.25s ease",

                      "&:hover": {
                        bgcolor: theme.palette.secondary.light,
                        transform: "translateY(-3px)",
                        boxShadow: `0 8px 24px ${theme.palette.common.black}33`,
                      },

                      "&:focus-visible": {
                        outline: "2px solid white",
                        outlineOffset: 3,
                      },
                    }}
                  >
                    Explore Courses
                  </Button>

                  <Button
                    component="a"
                    href="/signup"
                    variant="outlined"
                    sx={{
                      px: 3,
                      py: 1.35,
                      borderRadius: 2.5,
                      textTransform: "none",
                      fontWeight: 600,
                      color: theme.palette.primary.contrastText,
                      borderColor: `${theme.palette.common.white}59`,
                      transition: "all 0.25s ease",

                      "&:hover": {
                        borderColor: theme.palette.primary.contrastText,
                        bgcolor: `${theme.palette.common.white}14`,
                        transform: "translateY(-3px)",
                      },

                      "&:focus-visible": {
                        outline: "2px solid white",
                        outlineOffset: 3,
                      },
                    }}
                  >
                    Create Free Account
                  </Button>
                </Box>
              </motion.div>
            </Box>

            {/* Right visual card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: 3 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              whileHover={{ y: -8, rotate: -1 }}
              style={{
                width: "100%",
                maxWidth: 310,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  p: 3,
                  borderRadius: 4,
                  bgcolor: `${theme.palette.common.white}1a`,
                  border: `1px solid ${theme.palette.common.white}2e`,
                  backdropFilter: "blur(12px)",
                  boxShadow: `0 24px 60px ${theme.palette.common.black}33`,
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 3,
                    bgcolor: theme.palette.secondary.light,
                    color: theme.palette.primary.main,
                    mb: 3,
                  }}
                >
                  <GraduationCap size={28} />
                </Box>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: theme.palette.secondary.light,
                    fontWeight: 700,
                    letterSpacing: 1,
                    mb: 1,
                  }}
                >
                  YOUR LEARNING JOURNEY
                </Typography>

                <Typography
                  component="h3"
                  sx={{
                    fontSize: 25,
                    lineHeight: 1.3,
                    fontWeight: 750,
                    mb: 1.5,
                  }}
                >
                  Small steps.
                  <br />
                  Big achievements.
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: theme.palette.secondary.light,
                    mb: 3,
                  }}
                >
                  Every lesson brings you closer to your next milestone.
                </Typography>

                {/* Learning reminder */}
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    borderRadius: 3,
                    bgcolor: `${theme.palette.common.white}17`,
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 2,
                      bgcolor: `${theme.palette.secondary.main}2e`,
                      color: theme.palette.secondary.light,
                      flexShrink: 0,
                    }}
                  >
                    <BookOpen size={21} />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                      Keep learning
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 11,
                        color: theme.palette.secondary.light,
                      }}
                    >
                      Your future is worth it
                    </Typography>
                  </Box>

                  <ArrowRight
                    size={18}
                    color={theme.palette.secondary.light}
                  />
                </Box>

                {/* Floating decoration */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    top: -18,
                    right: -12,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 3,
                      bgcolor: theme.palette.warning.light,
                      color: theme.palette.warning.dark,
                      boxShadow: `0 8px 25px ${theme.palette.common.black}2e`,
                    }}
                  >
                    <Sparkles size={22} />
                  </Box>
                </motion.div>
              </Box>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
