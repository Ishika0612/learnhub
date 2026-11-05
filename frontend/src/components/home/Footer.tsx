"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

import {
  Box,
  Container,
  Typography,
  Divider,
} from "@mui/material";

import { ArrowRight, GraduationCap } from "lucide-react";
import theme from "@/theme";
import { getApprovedCourses } from "@/lib/courseApi";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Log in", href: "/login" },
  { label: "Get started", href: "/register" },
];

export default function Footer() {
  const [courseCategories, setCourseCategories] = useState<string[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    getApprovedCourses()
      .then((courses) => {
        if (active) {
          setCourseCategories(
            [...new Set(courses.map((course) => course.category))].sort(),
          );
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setLoadError(
            cause instanceof Error ? cause.message : "Could not load course categories.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
        pt: { xs: 6, md: 8 },
        pb: 2,
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "1.3fr 0.8fr 1fr 1.2fr",
            },
            gap: { xs: 4, md: 5 },
            pb: 5,
          }}
        >
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Box
              component="a"
              href="/"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1.2,
                color: theme.palette.primary.contrastText,
                textDecoration: "none",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: theme.palette.secondary.light,
                  color: theme.palette.primary.main,
                  borderRadius: 2.5,
                }}
              >
                <GraduationCap size={25} />
              </Box>

              <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
                Learn
                <Box component="span" sx={{ color: theme.palette.secondary.light }}>
                  Hub
                </Box>
              </Typography>
            </Box>

            <Typography
              sx={{
                color: theme.palette.secondary.light,
                fontSize: 13,
                lineHeight: 1.9,
                maxWidth: 290,
                mb: 2.5,
              }}
            >
              Learn new skills, explore your potential, and build a brighter
              future with practical, flexible online education.
            </Typography>

          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 2.5 }}>
              Quick Links
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {quickLinks.map((link) => (
                <Box
                  key={link.label}
                  component="a"
                  href={link.href}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.7,
                    width: "fit-content",
                    color: theme.palette.secondary.light,
                    fontSize: 13,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: theme.palette.secondary.light,
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <ArrowRight size={13} />
                  {link.label}
                </Box>
              ))}
            </Box>
          </motion.div>

          {/* Published course categories */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 2.5 }}>
              Course categories
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {courseCategories.map((category) => (
                <Box
                  key={category}
                  component="a"
                  href={`/courses?category=${encodeURIComponent(category)}`}
                  sx={{
                    width: "fit-content",
                    color: theme.palette.secondary.light,
                    fontSize: 13,
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                    "&:hover": { color: theme.palette.secondary.light },
                  }}
                >
                  {category}
                </Box>
              ))}
              {loadError ? (
                <Typography role="alert" sx={{ color: theme.palette.error.light, fontSize: 12 }}>
                  {loadError}
                </Typography>
              ) : courseCategories.length === 0 ? (
                <Typography sx={{ color: theme.palette.secondary.light, fontSize: 13 }}>
                  No published courses yet.
                </Typography>
              ) : null}
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1.5 }}>
            Start learning
            </Typography>
            <Typography sx={{ color: theme.palette.secondary.light, fontSize: 13, lineHeight: 1.8 }}>
            Explore courses published by LearnHub instructors and enroll to begin learning.
            </Typography>
            <Box
            component="a"
            href="/courses"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.7,
              mt: 2,
              color: theme.palette.secondary.light,
              fontSize: 13,
              textDecoration: "none",
            }}
            >
            Browse courses <ArrowRight size={14} />
            </Box>
          </motion.div>
        </Box>

        <Divider sx={{ borderColor: theme.palette.primary.light }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            pt: 2.5,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: theme.palette.secondary.light,
              textAlign: "center",
            }}
          >
            LearnHub. All rights reserved.
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: { xs: 2, sm: 2.5 },
            }}
          >
            <Box
              component="a"
              href="/privacy"
              sx={{
                color: theme.palette.secondary.light,
                fontSize: 12,
                textDecoration: "none",
                "&:hover": { color: theme.palette.primary.contrastText },
              }}
            >
              Privacy Policy
            </Box>

            <Box
              component="a"
              href="/terms"
              sx={{
                color: theme.palette.secondary.light,
                fontSize: 12,
                textDecoration: "none",
                "&:hover": { color: theme.palette.primary.contrastText },
              }}
            >
              Terms of Service
            </Box>

          </Box>
        </Box>
      </Container>
    </Box>
  );
}
