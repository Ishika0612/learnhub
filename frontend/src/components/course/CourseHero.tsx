
"use client";

import type { FormEvent } from "react";
import { motion } from "motion/react";
import {
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { BookOpen, Search, Star, Users } from "lucide-react";
import theme from "@/theme";

type CoursesHeroProps = {
  search: string;
  setSearch: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
};

export default function CoursesHero({
  search,
  setSearch,
  onSearch,
}: CoursesHeroProps) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(120deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.light} 58%, ${theme.palette.primary.main} 100%)`,
        color: theme.palette.primary.contrastText,
        py: { xs: 5, md: 7 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 260,
          height: 260,
          top: -130,
          right: { xs: -150, md: "10%" },
          border: `1px solid ${theme.palette.primary.contrastText}1f`,
          borderRadius: "50%",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Chip
            label="YOUR NEXT SKILL STARTS HERE"
            size="small"
            sx={{
              mb: 2,
              bgcolor: `${theme.palette.primary.contrastText}1f`,
              color: theme.palette.secondary.light,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          />

          <Typography
            component="h1"
            sx={{
              maxWidth: 700,
              mx: "auto",
              fontSize: { xs: 32, sm: 40, md: 48 },
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: "-1.8px",
            }}
          >
            Find the right course.
            <Box component="span" sx={{ color: theme.palette.secondary.light }}>
              {" "}Build your future.
            </Box>
          </Typography>

          <Typography
            sx={{
              mt: 1.5,
              maxWidth: 590,
              mx: "auto",
              color: theme.palette.secondary.light,
              fontSize: { xs: 15, md: 17 },
              lineHeight: 1.8,
            }}
          >
            Explore practical courses to learn in-demand skills,
            build projects and move forward with confidence.
          </Typography>

          <Box
            component="form"
            onSubmit={onSearch}
            sx={{
              mt: 3,
              p: 0.6,
              display: "flex",
              gap: 1,
              maxWidth: 650,
              width: "100%",
              mx: "auto",
              bgcolor: theme.palette.background.paper,
              borderRadius: 3,
              boxShadow: `0 12px 36px ${theme.palette.common.black}26`,
            }}
          >
            <TextField
              fullWidth
              variant="standard"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="What do you want to learn?"
              slotProps={{
                input: {
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                px: 1.5,
                "& input": { py: 1.2, color: theme.palette.text.primary },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              sx={{
                minWidth: { xs: 88, sm: 115 },
                px: 2,
                borderRadius: 2,
                bgcolor: theme.palette.primary.light,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: theme.palette.primary.main,
                  boxShadow: "none",
                },
              }}
            >
              Search
            </Button>
          </Box>

          <Box
            sx={{
              mt: 2.5,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: { xs: 2, sm: 3 },
              color: theme.palette.secondary.light,
              fontSize: 13,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <BookOpen size={16} />
              Practical learning
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Star size={16} />
              Expert-led lessons
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Users size={16} />
              Learn at your pace
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
