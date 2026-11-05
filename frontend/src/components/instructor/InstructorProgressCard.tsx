
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Typography,
} from "@mui/material";
import { GraduationCap } from "lucide-react";
import theme from "@/theme";

type InstructorProgressCardProps = {
  averageProgress: number;
};

export default function InstructorProgressCard({
  averageProgress,
}: InstructorProgressCardProps) {
  const progress = Math.min(100, Math.max(0, averageProgress));

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderColor: theme.palette.divider,
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <GraduationCap size={22} />

          <Typography variant="body2" color="text.secondary">
            Average Student Progress
          </Typography>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          {averageProgress.toFixed(1)}%
        </Typography>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          Average progress across your enrollments
        </Typography>
      </CardContent>
    </Card>
  );
}
