import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import type { AppUser, UserProfilePatch } from '../state/appDataTypes';
import { imageFileToDataUrl } from '../services/imageUpload';

type ProfileEditorDialogProps = {
  open: boolean;
  user: AppUser | null;
  onClose: () => void;
  onSave: (patch: UserProfilePatch) => void;
};

const ProfileEditorDialog: React.FC<ProfileEditorDialogProps> = ({ open, user, onClose, onSave }) => {
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [taste, setTaste] = useState('');
  const [favoriteTrack, setFavoriteTrack] = useState('');
  const [favoritePlaylist, setFavoritePlaylist] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [bio, setBio] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDisplayName(user?.displayName || '');
    setLocation(user?.location || '');
    setTaste(user?.taste || '');
    setFavoriteTrack(user?.favoriteTrack || '');
    setFavoritePlaylist(user?.favoritePlaylist || '');
    setLookingFor(user?.lookingFor || '');
    setBio(user?.bio || '');
    setTagsText((user?.profileTags || []).join(', '));
    setImage(user?.image);
    setUploadError(null);
    setProcessingImage(false);
  }, [open, user]);

  const tags = tagsText.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 5);

  const handleSave = () => {
    onSave({
      bio,
      displayName,
      favoritePlaylist,
      favoriteTrack,
      image,
      location,
      lookingFor,
      profileTags: tags,
      taste,
    });
    onClose();
  };

  const handleImage = async (file?: File) => {
    if (!file) return;
    setProcessingImage(true);
    setUploadError(null);
    try {
      setImage(await imageFileToDataUrl(file, { maxSide: 520, quality: 0.78 }));
    } catch (error) {
      setUploadError((error as Error).message || 'Could not use that image.');
    } finally {
      setProcessingImage(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit your profile</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
            <Avatar src={image} sx={{ width: 88, height: 88, fontSize: 32, fontWeight: 900 }}>
              {displayName.trim()[0] || 'M'}
            </Avatar>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateRoundedIcon />} disabled={processingImage}>
                {processingImage ? 'Processing...' : 'Upload photo'}
                <input hidden type="file" accept="image/*" onChange={(event) => void handleImage(event.target.files?.[0])} />
              </Button>
              <Button variant="text" color="inherit" startIcon={<DeleteRoundedIcon />} onClick={() => setImage(undefined)} disabled={!image || processingImage}>
                Remove
              </Button>
            </Stack>
          </Stack>
          {uploadError && <Alert severity="warning">{uploadError}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} fullWidth />
            <TextField label="Location" value={location} onChange={(event) => setLocation(event.target.value)} fullWidth />
          </Stack>
          <TextField
            label="Taste"
            value={taste}
            onChange={(event) => setTaste(event.target.value)}
            placeholder="M83, Robyn, Frank Ocean"
            fullWidth
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField label="Favorite track" value={favoriteTrack} onChange={(event) => setFavoriteTrack(event.target.value)} fullWidth />
            <TextField label="Featured playlist" value={favoritePlaylist} onChange={(event) => setFavoritePlaylist(event.target.value)} fullWidth />
          </Stack>
          <TextField
            label="Looking for"
            value={lookingFor}
            onChange={(event) => setLookingFor(event.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <TextField
            label="Bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <Box>
            <TextField
              label="Tags"
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
              placeholder="Night walks, Synth-pop, Soft R&B"
              fullWidth
            />
            <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.75 }}>
              {tags.length > 0 ? tags.map((tag) => <Chip key={tag} size="small" label={tag} />) : (
                <Typography variant="caption" color="text.secondary">Add up to five comma-separated tags.</Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!displayName.trim()}>Save profile</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileEditorDialog;
