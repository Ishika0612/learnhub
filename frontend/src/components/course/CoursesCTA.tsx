
"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Box, Button, Typography } from "@mui/material";
import theme from "@/theme";

export default function CoursesCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          mt: { xs: 4, md: 6 },
          p: { xs: 2.5, md: 3.5 },
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          borderRadius: 3,
          bgcolor: theme.palette.info.light,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 19, md: 22 },
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: theme.palette.primary.main,
            }}
          >
            Have knowledge to share?
          </Typography>

          <Typography
            sx={{
              mt: 0.75,
              color: theme.palette.text.secondary,
              fontSize: 13,
            }}
          >
            Help others grow by teaching what you know.
          </Typography>
        </Box>

        <Button
          component="a"
          href="/instructor/teach"
          endIcon={<ArrowRight size={17} />}
          sx={{
            px: 2.25,
            py: 1.1,
            borderRadius: 2,
            bgcolor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText,
            textTransform: "none",
            fontWeight: 700,
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: theme.palette.primary.main },
          }}
        >
          Become an instructor
        </Button>
      </Box>
    </motion.div>
  );
}
