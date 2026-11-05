"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Users,
  UserRound,
  GraduationCap,
} from "lucide-react";
import { Box, Typography } from "@mui/material";
import theme from "@/theme";

const navigation = [
  { label: "Overview", href: "/instructor", icon: LayoutDashboard },
  { label: "My Courses", href: "/instructor/courses", icon: BookOpen },
  { label: "Create Course", href: "/instructor/courses/create", icon: PlusCircle },
  { label: "Students", href: "/instructor/students", icon: Users },
  { label: "My Profile", href: "/instructor/profile", icon: UserRound },
];

export default function InstructorSidebar() {
  const pathname = usePathname();

  return (
    <Box
      component="aside"
      sx={{
        width: { md: 260 },
        minWidth: { md: 260 },
        flexShrink: 0,
        position: { md: "sticky" },
        top: { md: 0 },
        height: { md: "100dvh" },
        display: "flex",
        flexDirection: { xs: "row", md: "column" },
        alignItems: { xs: "center", md: "stretch" },
        gap: { xs: 1.5, md: 0 },
        px: { xs: 1.5, md: 2 },
        py: { xs: 1.25, md: 2.5 },
        bgcolor: theme.palette.background.paper,
        borderRight: { xs: 0, md: `1px solid ${theme.palette.divider}` },
        borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: 0 },
        zIndex: 2,
      }}
    >
      <Box
        component={Link}
        href="/instructor"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          minWidth: { xs: 42, md: 0 },
          mr: { xs: 0.5, md: 0 },
          mb: { md: 3.5 },
          color: theme.palette.primary.main,
          textDecoration: "none",
        }}
      >
        <Box
          sx={{
            p: 1,
            display: "grid",
            placeItems: "center",
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: 2,
          }}
        >
          <GraduationCap size={21} />
        </Box>
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <Typography sx={{ fontWeight: 850, lineHeight: 1.2 }}>
            LearnHub
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Instructor workspace
          </Typography>
        </Box>
      </Box>

      <Box
        component="nav"
        aria-label="Instructor navigation"
        sx={{
          display: "flex",
          flex: 1,
          minWidth: 0,
          overflowX: { xs: "auto", md: "visible" },
          overflowY: "hidden",
          gap: 0.5,
          flexDirection: { xs: "row", md: "column" },
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {navigation.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/instructor" && pathname.startsWith(`${href}/`));

          return (
            <Box
              component={Link}
              href={href}
              key={href}
              title={label}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "center", md: "flex-start" },
                gap: 1.25,
                flexShrink: 0,
                px: 1.5,
                py: 1.2,
                borderRadius: 2,
                textDecoration: "none",
                color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                bgcolor: active ? theme.palette.accent.light : "transparent",
                fontWeight: active ? 750 : 550,
                fontSize: 13,
                transition: "background-color 160ms ease, color 160ms ease",
                "&:hover": {
                  bgcolor: active ? theme.palette.accent.light : theme.palette.background.default,
                  color: theme.palette.primary.main,
                },
                "&:focus-visible": {
                  outline: `2px solid ${theme.palette.secondary.main}`,
                  outlineOffset: 2,
                },
              }}
            >
              <Icon size={18} />
              <Typography
                component="span"
                sx={{ display: { xs: "none", sm: "inline" }, fontSize: "inherit", fontWeight: "inherit", whiteSpace: "nowrap" }}
              >
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>

    </Box>
  );
}
