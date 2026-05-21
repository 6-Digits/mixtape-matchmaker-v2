import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import type { Playlist, Song } from '../data/demo';
import { imageFileToDataUrl } from '../services/imageUpload';
import PlaylistDetailsForm from './playlist-editor/PlaylistDetailsForm';
import SongSearchAdd from './playlist-editor/SongSearchAdd';
import TracklistEditor from './playlist-editor/TracklistEditor';
import { useAudioPreview } from './playlist-editor/useAudioPreview';
import { useSongSearch } from './playlist-editor/useSongSearch';

type Props = {
  open: boolean;
  playlist: Playlist | null;
  onClose: () => void;
  onSaveDetails: (patch: { title?: string; description?: string; image?: string }) => void;
  onAddSong: (song: Song) => void;
  onRemoveSong: (index: number) => void;
  onMoveSong: (fromIndex: number, toIndex: number) => void;
};

const EditPlaylistDialog: React.FC<Props> = ({
  open,
  playlist,
  onClose,
  onSaveDetails,
  onAddSong,
  onRemoveSong,
  onMoveSong,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const { playPreview, previewKey, previewLoading } = useAudioPreview(open);
  const songSearch = useSongSearch(open);

  useEffect(() => {
    if (!playlist) return;
    setTitle(playlist.title);
    setDescription(playlist.description);
    setImage(undefined);
    setUploadError(null);
    setProcessingImage(false);
    songSearch.resetSearch();
  }, [playlist?.id, open]);

  const detailsChanged = useMemo(() => {
    if (!playlist) return false;
    return title.trim() !== playlist.title || description.trim() !== playlist.description || Boolean(image);
  }, [playlist, title, description, image]);

  if (!playlist) return null;

  const handleImage = async (file?: File) => {
    if (!file) return;
    setProcessingImage(true);
    setUploadError(null);
    try {
      setImage(await imageFileToDataUrl(file));
    } catch (error) {
      setUploadError((error as Error).message || 'Could not use that image.');
    } finally {
      setProcessingImage(false);
    }
  };

  const handleSave = () => {
    if (detailsChanged) {
      onSaveDetails({ title: title.trim() || playlist.title, description: description.trim(), image });
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
            height: { md: 'min(760px, calc(100vh - 64px))' },
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: { xs: 2, md: 3 },
          py: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
            <Chip size="small" icon={<EditRoundedIcon />} label="Editing" color="primary" variant="outlined" />
            {detailsChanged && <Chip size="small" label="Unsaved changes" color="warning" />}
          </Stack>
          <Typography variant="h5" sx={{ lineHeight: 1.08 }} noWrap>{playlist.title}</Typography>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mt: 0.75, color: 'text.secondary' }}>
            <QueueMusicRoundedIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">
              {playlist.songs.length} songs
            </Typography>
          </Stack>
        </Box>
        <IconButton onClick={onClose} aria-label="Close">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={0} sx={{ height: { md: '100%' }, minHeight: { md: 560 } }}>
          <PlaylistDetailsForm
            description={description}
            image={image}
            imageFallback={playlist.image}
            processingImage={processingImage}
            title={title}
            uploadError={uploadError}
            onDescriptionChange={setDescription}
            onImageChange={(file) => void handleImage(file)}
            onTitleChange={setTitle}
          />

          <Box
            sx={{
              p: { xs: 2, md: 3 },
              flex: 1,
              minWidth: 0,
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <TracklistEditor
              previewKey={previewKey}
              previewLoading={previewLoading}
              songs={playlist.songs}
              onMoveSong={onMoveSong}
              onPreview={(song) => void playPreview(song)}
              onRemoveSong={onRemoveSong}
            />
            <SongSearchAdd
              options={songSearch.options}
              previewKey={previewKey}
              query={songSearch.query}
              searching={songSearch.searching}
              selected={songSearch.selected}
              onAddSong={onAddSong}
              onPreview={(song) => void playPreview(song)}
              onQueryChange={songSearch.setQuery}
              onResetSearch={songSearch.resetSearch}
              onSelectedChange={songSearch.setSelected}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, md: 3 }, py: 1.5, bgcolor: 'background.paper' }}>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleSave} variant="contained" disabled={!detailsChanged || processingImage}>Save changes</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPlaylistDialog;
