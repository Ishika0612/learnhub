
import { Box, Card, CardContent, Typography } from "@mui/material";
import type { ReactNode } from "react";
import theme from "@/theme";

type InstructorStatCardProps = {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
};

export default function InstructorStatCard({
  title,
  value,
  description,
  icon,
}: InstructorStatCardProps) {
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>

          {icon}
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
