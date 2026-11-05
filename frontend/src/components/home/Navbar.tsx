"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  InputBase,
  Toolbar,
  Typography,
} from "@mui/material";

import {
  BookOpen,
  Search,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import theme from "@/theme";
import { getAccessToken } from "@/lib/api";
import LogoutButton from "@/components/auth/LogoutButton";

const navLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Categories", href: "/categories" },
  { label: "Teach on LearnHub", href: "/instructor/login" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsAuthenticated(Boolean(getAccessToken()));
  }, []);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/courses");
    } else {
      router.push(`/courses?q=${encodeURIComponent(trimmedQuery)}`);
    }

    setMobileOpen(false);
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{
        bgcolor: `${theme.palette.background.paper}f0`,
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: "76px !important",
            gap: { xs: 1.5, md: 2.5 },
          }}
        >
          {/* Logo */}
          <Box
            component="a"
            href="/"
            aria-label="LearnHub home"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              flexShrink: 0,
              textDecoration: "none",
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                color: theme.palette.primary.contrastText,
                background:
                  `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`,
              }}
            >
              <BookOpen size={23} />
            </Box>

            <Typography
              component="span"
              sx={{
                fontWeight: 850,
                fontSize: 22,
                letterSpacing: "-0.8px",
                color: theme.palette.text.primary,
                whiteSpace: "nowrap",
              }}
            >
              Learn
              <Box component="span" sx={{ color: theme.palette.accent.main }}>
                Hub
              </Box>
            </Typography>
          </Box>

          {/* Desktop Search */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: { xs: "none", lg: "flex" },
              alignItems: "center",
              ml: 1,
              px: 1.5,
              py: 0.7,
              bgcolor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2.5,
              width: 250,
              transition: "border-color 0.2s, box-shadow 0.2s",
              "&:focus-within": {
                borderColor: theme.palette.accent.main,
                boxShadow: `0 0 0 3px ${theme.palette.accent.main}1a`,
              },
            }}
          >
            <Search size={19} color={theme.palette.text.secondary} />

            <InputBase
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              sx={{
                ml: 1,
                flex: 1,
                minWidth: 0,
                fontSize: 13,
              }}
              slotProps={{
                input: {
                  "aria-label": "Search courses",
                },
              }}
            />
          </Box>

          {/* Desktop Navigation */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 3,
              ml: "auto",
            }}
          >
            {navLinks.map((item) => (
              <Typography
                key={item.label}
                component="a"
                href={item.href}
                sx={{
                  fontSize: 13.5,
                  fontWeight: 650,
                  color: theme.palette.text.secondary,
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  transition: "color 0.2s",
                  "&:hover": {
                    color: theme.palette.primary.light,
                  },
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Box>

          {/* Authentication Buttons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              ml: { xs: "auto", md: 2 },
              flexShrink: 0,
            }}
          >
            {isAuthenticated ? (
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <LogoutButton
                  sx={{
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.divider,
                  }}
                />
              </Box>
            ) : (
              <>
                <Button
                  component="a"
                  href="/login"
                  color="inherit"
                  sx={{
                    display: { xs: "none", sm: "inline-flex" },
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    textTransform: "none",
                  }}
                >
                  Log in
                </Button>

                <Button
                  component="a"
                  href="/register"
                  variant="contained"
                  startIcon={<GraduationCap size={18} />}
                  sx={{
                    whiteSpace: "nowrap",
                    bgcolor: theme.palette.primary.light,
                    borderRadius: 2,
                    px: { xs: 1.5, sm: 2 },
                    py: 1,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: theme.palette.primary.dark,
                      boxShadow: `0 4px 12px ${theme.palette.primary.main}2e`,
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{ display: { xs: "none", sm: "inline" } }}
                  >
                    Get started
                  </Box>
                  <Box
                    component="span"
                    sx={{ display: { xs: "inline", sm: "none" } }}
                  >
                    Join
                  </Box>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <IconButton
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
              sx={{
                display: { xs: "inline-flex", md: "none" },
                color: theme.palette.text.primary,
              }}
            >
              <Menu size={24} />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
     <Drawer
  anchor="right"
  open={mobileOpen}
  onClose={closeMobileMenu}
  slotProps={{
    paper: {
      sx: {
        width: {
          xs: "min(290px, 85vw)",
          sm: 320,
        },
        bgcolor: theme.palette.background.paper,
      },
    },
  }}
>
        <Box sx={{ p: 3 }}>
          {/* Drawer Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 4,
            }}
          >
            <Box
              component="a"
              href="/"
              onClick={closeMobileMenu}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  color: theme.palette.common.white,
                  background:
                    `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.accent.main})`,
                }}
              >
                <BookOpen size={19} />
              </Box>

              <Typography
                component="span"
                sx={{
                  fontWeight: 800,
                  fontSize: 19,
                  color: theme.palette.text.primary,
                }}
              >
                Learn
                <Box component="span" sx={{ color: theme.palette.accent.main }}>
                  Hub
                </Box>
              </Typography>
            </Box>

            <IconButton
              aria-label="Close navigation menu"
              onClick={closeMobileMenu}
            >
              <X size={21} />
            </IconButton>
          </Box>

          {/* Drawer Navigation Links */}
          <Typography
            sx={{
              mb: 2,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: theme.palette.text.disabled,
              textTransform: "uppercase",
            }}
          >
            Explore
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {navLinks.map((item) => (
              <Box
                key={item.label}
                component="a"
                href={item.href}
                onClick={closeMobileMenu}
                sx={{
                  display: "block",
                  py: 1.4,
                  px: 1.5,
                  borderRadius: 2,
                  fontSize: 14,
                  fontWeight: 650,
                  color: theme.palette.text.primary,
                  textDecoration: "none",
                  transition: "background-color 0.2s, color 0.2s",
                  "&:hover": {
                    bgcolor: theme.palette.accent.light,
                    color: theme.palette.accent.main,
                  },
                }}
              >
                {item.label}
              </Box>
            ))}
          </Box>

          {/* Mobile Search */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: "flex",
              alignItems: "center",
              mt: 3,
              p: 1,
              bgcolor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              "&:focus-within": {
                borderColor: theme.palette.accent.main,
              },
            }}
          >
            <InputBase
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: 14,
                pl: 1,
              }}
              inputProps={{
                "aria-label": "Search courses",
              }}
            />

            <IconButton
              type="submit"
              aria-label="Search courses"
              size="small"
              sx={{ color: theme.palette.primary.light }}
            >
              <Search size={19} />
            </IconButton>
          </Box>

          {/* Mobile Authentication */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              mt: 3,
            }}
          >
            {isAuthenticated ? (
              <LogoutButton
                fullWidth
                sx={{
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  borderRadius: 2,
                  py: 1,
                }}
              />
            ) : (
              <>
                <Button
                  component="a"
                  href="/login"
                  variant="outlined"
                  fullWidth
                  onClick={closeMobileMenu}
                  sx={{
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.primary,
                    borderRadius: 2,
                    py: 1,
                    fontWeight: 700,
                    textTransform: "none",
                  }}
                >
                  Log in
                </Button>
                <Button
                  component="a"
                  href="/register"
                  variant="contained"
                  fullWidth
                  onClick={closeMobileMenu}
                  startIcon={<GraduationCap size={18} />}
                  sx={{
                    bgcolor: theme.palette.primary.light,
                    borderRadius: 2,
                    py: 1,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: theme.palette.primary.dark,
                      boxShadow: "none",
                    },
                  }}
                >
                  Get started
                </Button>
              </>
            )}
          </Box>

          {/* Drawer Footer */}
          <Typography
            sx={{
              mt: 4,
              fontSize: 12,
              textAlign: "center",
              color: theme.palette.text.disabled,
            }}
          >
            Learn something new every day.
          </Typography>
        </Box>
      </Drawer>
    </AppBar>
  );
}
