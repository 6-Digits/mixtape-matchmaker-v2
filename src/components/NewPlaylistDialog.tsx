import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { imageFileToDataUrl } from '../services/imageUpload';

type Props = {
  open: boolean;
  fallbackImage?: string;
  onClose: () => void;
  onCreate: (input: { title: string; description: string; image?: string }) => void;
};

const NewPlaylistDialog: React.FC<Props> = ({ open, fallbackImage, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDescription('');
    setImage(undefined);
    setError(null);
    setProcessing(false);
  }, [open]);

  const handleImage = async (file?: File) => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      setImage(await imageFileToDataUrl(file));
    } catch (uploadError) {
      setError((uploadError as Error).message || 'Could not use that image.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreate = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Add a playlist title.');
      return;
    }
    onCreate({
      title: cleanTitle,
      description: description.trim() || 'A local UI-only playlist ready for real songs.',
      image,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New playlist</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box
            sx={{
              height: 190,
              borderRadius: 2,
              bgcolor: 'action.hover',
              backgroundImage: `url(${image || fallbackImage || ''})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: 1,
              borderColor: 'divider',
            }}
          />
          <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateRoundedIcon />} disabled={processing}>
            {processing ? 'Processing photo...' : 'Upload photo'}
            <input hidden type="file" accept="image/*" onChange={(event) => void handleImage(event.target.files?.[0])} />
          </Button>
          {error && <Alert severity="warning">{error}</Alert>}
          <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} fullWidth autoFocus />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <Typography variant="caption" color="text.secondary">
            Photos are resized before saving so UI-only mode keeps local storage under control.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleCreate} disabled={processing}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewPlaylistDialog;
