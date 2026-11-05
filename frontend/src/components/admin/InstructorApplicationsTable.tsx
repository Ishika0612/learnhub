
"use client";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { CheckCircle2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import type { InstructorApplication } from "@/lib/admin";

type Props = {
  applications: InstructorApplication[];
  loading: boolean;
  error: string;
  saving: boolean;
  onApprove: (application: InstructorApplication) => void;
  onReject: (application: InstructorApplication) => void;
};

export default function InstructorApplicationsTable({
  applications,
  loading,
  error,
  saving,
  onApprove,
  onReject,
}: Props) {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const filteredApplications = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return applications;
    return applications.filter((application) =>
      [
        application.full_name,
        application.email,
        application.phone_number ?? "",
        application.bio ?? "",
      ].some((value) => value.toLowerCase().includes(search)),
    );
  }, [applications, query]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Instructor applications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredApplications.length} of {applications.length} applications
          </Typography>
        </Box>
        <TextField
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search applicants"
          slotProps={{ htmlInput: { "aria-label": "Search instructor applications" } }}
          sx={{ width: { xs: "100%", sm: 280 }, bgcolor: theme.palette.background.paper }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderColor: theme.palette.divider, borderRadius: 2 }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.background.default }}>
              <TableCell sx={{ fontWeight: 700 }}>Applicant</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Applied</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                  <CircularProgress size={28} />
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 1.5 }}>
                    Loading applications...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredApplications.length === 0 && !error ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                  <CheckCircle2
                    size={30}
                    color={theme.palette.text.secondary}
                    style={{ margin: "0 auto 12px" }}
                  />
                  <Typography sx={{ fontWeight: 600 }}>
                    No pending applications
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {applications.length === 0
                      ? "New applications will appear here."
                      : "Try another search or clear the search field."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((application) => (
                <TableRow key={application.id} hover>
                  <TableCell sx={{ minWidth: 220 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                      <Avatar
                        src={application.profile_picture_url ?? undefined}
                        alt={application.full_name}
                        sx={{ width: 40, height: 40 }}
                      >
                        {application.full_name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          {application.full_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {application.email}
                        </Typography>
                      </Box>
                    </Box>
                    {application.bio && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.75, maxWidth: 300, overflowWrap: "anywhere" }}
                      >
                        {application.bio}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ minWidth: 150 }}>
                    {application.phone_number || "Not provided"}
                  </TableCell>

                  <TableCell sx={{ minWidth: 120 }}>
                    {application.created_at
                      ? new Date(application.created_at).toLocaleDateString()
                      : "—"}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={application.instructor_status}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ minWidth: 210 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle2 size={15} />}
                        disabled={saving}
                        onClick={() => onApprove(application)}
                        sx={{ textTransform: "none" }}
                      >
                        Approve
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<XCircle size={15} />}
                        disabled={saving}
                        onClick={() => onReject(application)}
                        sx={{ textTransform: "none" }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
