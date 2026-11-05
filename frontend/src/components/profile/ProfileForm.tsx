"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import {
  Check,
  ImagePlus,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { apiRequest, getAccessToken } from "@/lib/api";
import theme from "@/theme";

type ProfileRole = "student" | "instructor";

type UserProfile = {
  id: number;
  full_name: string;
  email: string;
  role: ProfileRole;
  bio: string | null;
  phone_number: string | null;
  profile_picture_url: string | null;
  is_active: boolean;
};

type ProfileDraft = {
  full_name: string;
  bio: string;
  phone_number: string;
};

const emptyDraft: ProfileDraft = {
  full_name: "",
  bio: "",
  phone_number: "",
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfileForm({ role }: { role?: ProfileRole }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isDirty = useMemo(
    () =>
      Boolean(
        profile &&
          (draft.full_name !== profile.full_name ||
            draft.bio !== (profile.bio ?? "") ||
            draft.phone_number !== (profile.phone_number ?? "")),
      ),
    [draft, profile],
  );

  const completion = useMemo(() => {
    if (!profile) return 0;
    const completedFields = [
      Boolean(draft.full_name.trim()),
      Boolean(profile.email),
      Boolean(draft.phone_number.trim()),
      Boolean(draft.bio.trim()),
      Boolean(profile.profile_picture_url || photoPreview),
    ].filter(Boolean).length;
    return Math.round((completedFields / 5) * 100);
  }, [draft, photoPreview, profile]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        if (!getAccessToken()) {
          router.replace(
            role
              ? `/login?redirect=%2F${role}%2Fprofile`
              : "/login?redirect=%2Fprofile",
          );
          return;
        }

        const data = await apiRequest<UserProfile>("/profile/me", {
          cache: "no-store",
        });
        if (!active) return;
        if (role && data.role !== role) {
          router.replace(data.role === "student" ? "/student" : "/instructor");
          return;
        }
        setProfile(data);
        setDraft({
          full_name: data.full_name,
          bio: data.bio ?? "",
          phone_number: data.phone_number ?? "",
        });
      } catch (cause: unknown) {
        if (active) {
          setError(
            cause instanceof Error ? cause.message : "Could not load your profile.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [role, router]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || saving) return;

    const name = draft.full_name.trim();
    const phone = draft.phone_number.trim();
    if (name.length < 2) {
      setError("Enter a name with at least 2 characters.");
      return;
    }
    if (phone && phone.length < 7) {
      setError("Enter a phone number with at least 7 characters, or leave it blank.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await apiRequest<UserProfile>("/profile/me", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: name,
          bio: draft.bio.trim() || null,
          phone_number: phone || null,
        }),
      });
      setProfile(updated);
      setDraft({
        full_name: updated.full_name,
        bio: updated.bio ?? "",
        phone_number: updated.phone_number ?? "",
      });
      setSuccess("Your profile changes are saved.");
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Could not save your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP photo.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("Choose a photo that is 5 MB or smaller.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setUploadingPhoto(true);
    setError("");
    setSuccess("");
    try {
      const updated = await apiRequest<UserProfile>("/profile/me/photo", {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      setProfile(updated);
      setPhotoPreview("");
      setSuccess("Your profile photo has been updated.");
    } catch (cause: unknown) {
      setPhotoPreview("");
      setError(
        cause instanceof Error ? cause.message : "Could not upload your photo.",
      );
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingPhoto(false);
    }
  }

  async function removePhoto() {
    if (!profile?.profile_picture_url || removingPhoto) return;
    setRemovingPhoto(true);
    setError("");
    setSuccess("");
    try {
      const updated = await apiRequest<UserProfile>("/profile/me/photo", {
        method: "DELETE",
      });
      setProfile(updated);
      setSuccess("Your profile photo has been removed.");
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Could not remove your photo.",
      );
    } finally {
      setRemovingPhoto(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
        <CircularProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Loading your profile…
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1050, mx: "auto", display: "grid", gap: 2.5 }}>
      <Box>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 850, color: theme.palette.primary.main }}>
          Profile settings
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          Keep your account details and profile photo up to date.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success" icon={<Check size={18} />}>{success}</Alert>}

      {!profile ? (
        <Card variant="outlined" sx={{ borderColor: theme.palette.divider, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Typography sx={{ fontWeight: 750 }}>
              Your profile could not be loaded.
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
              Check your connection and reload this page to try again.
            </Typography>
            <Button onClick={() => window.location.reload()} sx={{ mt: 1.5 }}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(260px, 0.75fr) minmax(0, 1.5fr)" },
            alignItems: "start",
            gap: 2.5,
          }}
        >
          <Card variant="outlined" sx={{ borderColor: theme.palette.divider, borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                <Typography component="h2" sx={{ fontWeight: 800 }}>
                  Profile overview
                </Typography>
                <Chip
                  size="small"
                  icon={<ShieldCheck size={14} />}
                  label={profile.role}
                  color={profile.is_active ? "success" : "default"}
                  variant="outlined"
                  sx={{ textTransform: "capitalize" }}
                />
              </Box>

              <Box sx={{ display: "grid", justifyItems: "center", textAlign: "center", py: 3 }}>
                <Avatar
                  src={photoPreview || profile.profile_picture_url || undefined}
                  alt={profile.full_name}
                  sx={{
                    width: 112,
                    height: 112,
                    mb: 2,
                    bgcolor: theme.palette.accent.light,
                    color: theme.palette.primary.main,
                    border: `4px solid ${theme.palette.background.paper}`,
                    boxShadow: `0 0 0 1px ${theme.palette.divider}`,
                    fontSize: 40,
                  }}
                >
                  <UserRound size={42} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {profile.full_name}
                </Typography>
                <Typography color="text.secondary" variant="body2" sx={{ overflowWrap: "anywhere", mt: 0.25 }}>
                  {profile.email}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1, mt: 2.5 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={uploadPhoto}
                    aria-label="Choose a profile photo"
                  />
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={uploadingPhoto ? <CircularProgress size={15} color="inherit" /> : <ImagePlus size={16} />}
                    disabled={uploadingPhoto || removingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingPhoto ? "Uploading…" : "Upload photo"}
                  </Button>
                </Box>
                {profile.profile_picture_url && (
                  <Button
                    size="small"
                    color="error"
                    startIcon={removingPhoto ? <CircularProgress size={14} /> : <Trash2 size={15} />}
                    disabled={uploadingPhoto || removingPhoto}
                    onClick={() => void removePhoto()}
                    sx={{ mt: 0.5 }}
                  >
                    Remove photo
                  </Button>
                )}
                <Typography color="text.secondary" variant="caption" sx={{ mt: 1 }}>
                  JPEG, PNG, or WebP · up to 5 MB
                </Typography>
              </Box>

              <Box sx={{ pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Profile completeness
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {completion}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completion}
                  aria-label={`Profile ${completion}% complete`}
                  sx={{ height: 8, borderRadius: 5 }}
                />
                <Typography color="text.secondary" variant="caption" sx={{ display: "block", mt: 1 }}>
                  Add a photo and a short bio to help others recognize you.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderColor: theme.palette.divider, borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography component="h2" sx={{ fontWeight: 800 }}>
                  Personal information
                </Typography>
                <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                  Your email is used to sign in and cannot be changed here.
                </Typography>
              </Box>

              <Box
                component="form"
                onSubmit={saveProfile}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Full name"
                  required
                  fullWidth
                  autoComplete="name"
                  slotProps={{ htmlInput: { maxLength: 150, minLength: 2 } }}
                  value={draft.full_name}
                  onChange={(event) => {
                    setDraft({ ...draft, full_name: event.target.value });
                    setSuccess("");
                  }}
                  helperText={`${draft.full_name.length}/150`}
                />
                <TextField
                  label="Email address"
                  fullWidth
                  value={profile.email}
                  disabled
                  slotProps={{
                    input: { startAdornment: <Mail size={17} style={{ marginRight: 10, color: theme.palette.text.disabled }} /> },
                  }}
                />
                <TextField
                  label="Phone number"
                  fullWidth
                  type="tel"
                  autoComplete="tel"
                  slotProps={{ htmlInput: { maxLength: 20 } }}
                  value={draft.phone_number}
                  onChange={(event) => {
                    setDraft({ ...draft, phone_number: event.target.value });
                    setSuccess("");
                  }}
                  helperText="Optional · include your country code"
                />
                <TextField
                  label="About you"
                  fullWidth
                  multiline
                  minRows={5}
                  maxRows={10}
                  slotProps={{ htmlInput: { maxLength: 1000 } }}
                  value={draft.bio}
                  onChange={(event) => {
                    setDraft({ ...draft, bio: event.target.value });
                    setSuccess("");
                  }}
                  helperText={`${draft.bio.length}/1000 · Share a short introduction`}
                  sx={{ gridColumn: { sm: "1 / -1" } }}
                />

                <Box
                  sx={{
                    gridColumn: { sm: "1 / -1" },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                    pt: 1,
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {isDirty ? "You have unsaved changes." : "Your profile is up to date."}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      disabled={!isDirty || saving}
                      onClick={() => {
                        setDraft({
                          full_name: profile.full_name,
                          bio: profile.bio ?? "",
                          phone_number: profile.phone_number ?? "",
                        });
                        setError("");
                        setSuccess("");
                      }}
                    >
                      Discard
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!isDirty || saving || uploadingPhoto}
                      startIcon={saving ? <CircularProgress size={15} color="inherit" /> : <Save size={16} />}
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
