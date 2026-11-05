
"use client";

import {
  Box,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { ArrowDownUp, ChevronRight, SlidersHorizontal, X } from "lucide-react";
type CourseFiltersProps = {
  categories: string[];
  levels: string[];
  activeCategory: string;
  setActiveCategory: (value: string) => void;
  activeLevel: string;
  setActiveLevel: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  onClear: () => void;
  hasFilters: boolean;
  studentWorkspace?: boolean;
};

export default function CourseFilters({
  categories,
  levels,
  activeCategory,
  setActiveCategory,
  activeLevel,
  setActiveLevel,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  onClear,
  hasFilters,
  studentWorkspace = false,
}: CourseFiltersProps) {
  const homeHref = studentWorkspace ? "/student" : "/";
  const coursesHref = studentWorkspace ? "/student/courses" : "/courses";
  return (
    <Box sx={{ mb: 3 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumbs
        separator={<ChevronRight size={15} />}
        aria-label="breadcrumb"
        sx={{
          mb: 2.5,
          "& .MuiBreadcrumbs-separator": {
            mx: 0.7,
            color: "text.disabled",
          },
        }}
      >
        <MuiLink
          component="a"
          href={homeHref}
          underline="hover"
          sx={{ color: "text.secondary", fontSize: 12 }}
        >
          Home
        </MuiLink>

        <MuiLink
          component="a"
          href={coursesHref}
          underline="hover"
          onClick={() => setActiveCategory("All Courses")}
          sx={{ color: "text.secondary", fontSize: 12 }}
        >
          Courses
        </MuiLink>

        {activeCategory !== "All Courses" && (
          <Typography
            sx={{ color: "primary.main", fontSize: 12, fontWeight: 700 }}
          >
            {activeCategory}
          </Typography>
        )}
      </Breadcrumbs>

      {/* Heading and actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "flex-end" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box>
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: 25, md: 30 },
              fontWeight: 800,
              letterSpacing: "-0.7px",
            }}
          >
            {activeCategory === "All Courses"
              ? "Explore all courses"
              : `Explore ${activeCategory}`}
          </Typography>

          <Typography sx={{ mt: 0.8, color: "text.secondary", fontSize: 13 }}>
            Find your interest and start learning something new.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<SlidersHorizontal size={16} />}
            sx={{
              color: "primary.main",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              px: 1.5,
              py: 1,
              textTransform: "none",
              fontWeight: 650,
              bgcolor: "background.paper",
              whiteSpace: "nowrap",
            }}
          >
            Filters
          </Button>

          <Select
            size="small"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            slotProps={{
              input: { "aria-label": "Sort courses" },
            }}
            startAdornment={
              <Box sx={{ display: "flex", mr: 0.8, color: "text.secondary" }}>
                <ArrowDownUp size={14} />
              </Box>
            }
            sx={{
              minWidth: { xs: 0, sm: 170 },
              flex: { xs: 1, sm: "initial" },
              bgcolor: "background.paper",
              borderRadius: 2,
              fontSize: 12,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "divider",
              },
            }}
          >
            <MenuItem value="price-low">Price: low to high</MenuItem>
            <MenuItem value="price-high">Price: high to low</MenuItem>
            <MenuItem value="newest">Newest</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Compact active category indicator */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
          py: 1.5,
          px: 2,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
            Category
          </Typography>

          <Typography sx={{ color: "primary.main", fontSize: 13, fontWeight: 750 }}>
            {activeCategory}
          </Typography>
        </Box>

        {activeCategory !== "All Courses" && (
          <Button
            size="small"
            onClick={() => setActiveCategory("All Courses")}
            sx={{ textTransform: "none", fontSize: 12 }}
          >
            View all courses
          </Button>
        )}
      </Box>

      {/* Expandable filter panel */}
      {showFilters && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr)) auto",
            },
            alignItems: "end",
            gap: 2,
            p: 2.5,
            mb: 3,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Box>
            <Typography sx={{ mb: 0.8, fontSize: 12, fontWeight: 700 }}>
              Course category
            </Typography>

            <Select
              fullWidth
              size="small"
              value={activeCategory}
              onChange={(event) => setActiveCategory(event.target.value)}
              slotProps={{
                input: { "aria-label": "Course category" },
              }}
              sx={{ borderRadius: 2, fontSize: 13 }}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box>
            <Typography sx={{ mb: 0.8, fontSize: 12, fontWeight: 700 }}>
              Course level
            </Typography>

            <Select
              fullWidth
              size="small"
              value={activeLevel}
              onChange={(event) => setActiveLevel(event.target.value)}
              slotProps={{
                input: { "aria-label": "Course level" },
              }}
              sx={{ borderRadius: 2, fontSize: 13 }}
            >
              {levels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level === "All Levels" ? "All levels" : level}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box>
            <Typography sx={{ mb: 0.8, fontSize: 12, fontWeight: 700 }}>
              Sort by
            </Typography>

            <Select
              fullWidth
              size="small"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              sx={{ borderRadius: 2, fontSize: 13 }}
            >
              <MenuItem value="price-low">Price: low to high</MenuItem>
              <MenuItem value="price-high">Price: high to low</MenuItem>
              <MenuItem value="newest">Newest</MenuItem>
            </Select>
          </Box>

          <Button
            onClick={onClear}
            startIcon={<X size={15} />}
            sx={{
              color: "text.secondary",
              textTransform: "none",
              fontWeight: 650,
              py: 1,
              whiteSpace: "nowrap",
            }}
          >
            Reset filters
          </Button>
        </Box>
      )}

      {hasFilters && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            onClick={onClear}
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 650,
              color: "text.secondary",
            }}
          >
            Clear all filters
          </Button>
        </Box>
      )}
    </Box>
  );
}
