"use client";

import { useEffect, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Camera,
  Code2,
  Database,
  Megaphone,
  Palette,
} from "lucide-react";
import theme from "@/theme";
import { getApprovedCourses } from "@/lib/courseApi";

const icons = [
  Code2,
  Palette,
  Database,
  BriefcaseBusiness,
  Megaphone,
  Camera,
];

export default function CategorySection() {
  const [categories, setCategories] = useState<[string, number][]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getApprovedCourses()
      .then((courses) => {
        if (!active) return;
        const counts = new Map<string, number>();
        courses.forEach((course) => {
          counts.set(course.category, (counts.get(course.category) ?? 0) + 1);
        });
        setCategories([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)));
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Could not load course categories.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!categories.length && !error) return null;

  return (
    <Box
      id="categories"
      component="section"
      sx={{ py: { xs: 8, md: 11 }, bgcolor: theme.palette.background.default }}
    >
      <Container maxWidth="lg">
        <Typography
          component="h2"
          sx={{
            mb: 1.5,
            color: theme.palette.primary.main,
            fontSize: { xs: 29, md: 38 },
            fontWeight: 850,
          }}
        >
          Explore course categories
        </Typography>
        <Typography sx={{ mb: 4, color: theme.palette.text.secondary }}>
          Browse categories based on published courses.
        </Typography>
        {error ? (
          <Typography role="alert" sx={{ color: theme.palette.error.main }}>
            {error}
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {categories.map(([category, count], index) => {
              const Icon = icons[index % icons.length] ?? BookOpen;
              return (
                <Box
                  key={category}
                  component="a"
                  href={`/courses?category=${encodeURIComponent(category)}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2.5,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    textDecoration: "none",
                    "&:hover": { borderColor: theme.palette.primary.main },
                  }}
                >
                  <Icon size={28} color={theme.palette.primary.main} />
                  <Box sx={{ flex: 1 }}>
                    <Typography component="h3" sx={{ fontWeight: 800 }}>
                      {category}
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: 13 }}>
                      {count} {count === 1 ? "published course" : "published courses"}
                    </Typography>
                  </Box>
                  <ArrowUpRight size={18} />
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
}
