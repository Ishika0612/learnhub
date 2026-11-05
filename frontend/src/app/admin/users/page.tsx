"use client";

import Link from "next/link";
import { Alert, Box, Button, Card, CardContent, Typography } from "@mui/material";
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";
import theme from "@/theme";

export default function AdminUsersPage() {
  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Box>
        <Typography
          component="h1"
          sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 850, color: theme.palette.primary.main }}
        >
          User management
        </Typography>
        <Typography sx={{ color: theme.palette.text.secondary, mt: 0.75, fontSize: 14 }}>
          Review access workflows currently supported by the platform.
        </Typography>
      </Box>

      <Alert severity="info">
        The backend does not currently provide an administrator user-directory endpoint, so account lists and account controls are not shown here.
      </Alert>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {[
          {
            title: "Instructor access",
            description: "Review pending instructor applications and approve or reject access.",
            href: "/admin/applications",
            action: "Review applications",
            icon: GraduationCap,
          },
          {
            title: "Course publishing",
            description: "Review course submissions before they appear in the public catalog.",
            href: "/admin/courses",
            action: "Review courses",
            icon: BookOpen,
          },
        ].map(({ title, description, href, action, icon: Icon }) => (
          <Card
            key={title}
            variant="outlined"
            sx={{
              borderColor: theme.palette.divider,
              borderRadius: 3,
              transition: "transform 160ms ease, box-shadow 160ms ease",
              "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(15, 23, 42, .07)" },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ p: 1.2, display: "grid", placeItems: "center", borderRadius: 2, bgcolor: theme.palette.accent.light, color: theme.palette.primary.main }}>
                  <Icon size={20} />
                </Box>
                <Typography component="h2" sx={{ fontWeight: 800 }}>{title}</Typography>
              </Box>
              <Typography sx={{ color: theme.palette.text.secondary, fontSize: 13, lineHeight: 1.7, mt: 2 }}>
                {description}
              </Typography>
              <Button
                component={Link}
                href={href}
                endIcon={<ArrowRight size={16} />}
                sx={{ mt: 1.5, px: 0, textTransform: "none", fontWeight: 750 }}
              >
                {action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: theme.palette.text.secondary }}>
        <ShieldCheck size={16} />
        <Typography variant="caption">
          Account review actions remain restricted to authorized administrators.
        </Typography>
      </Box>
    </Box>
  );
}
