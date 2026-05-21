import React from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';

type Props = {
  description: string;
  image?: string;
  imageFallback: string;
  processingImage: boolean;
  title: string;
  uploadError: string | null;
  onDescriptionChange: (value: string) => void;
  onImageChange: (file?: File) => void;
  onTitleChange: (value: string) => void;
};

const PlaylistDetailsForm: React.FC<Props> = ({
  description,
  image,
  imageFallback,
  processingImage,
  title,
  uploadError,
  onDescriptionChange,
  onImageChange,
  onTitleChange,
}) => (
  <Box
    sx={{
      width: { xs: '100%', md: 340 },
      flexShrink: 0,
      p: { xs: 2, md: 3 },
      bgcolor: 'background.paper',
      borderRight: { md: 1 },
      borderColor: { md: 'divider' },
    }}
  >
    <Paper
      variant="outlined"
      sx={{ p: 1.25, mb: 2, borderRadius: 2, bgcolor: 'background.default' }}
    >
      <Box
        sx={{
          aspectRatio: '1 / 1',
          borderRadius: 1.5,
          mb: 1.25,
          backgroundImage: `url(${image || imageFallback})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
        }}
      />
      <Button
        component="label"
        fullWidth
        variant="contained"
        size="small"
        startIcon={<AddPhotoAlternateRoundedIcon />}
        disabled={processingImage}
      >
        {processingImage ? 'Processing...' : 'Change cover'}
        <input hidden type="file" accept="image/*" onChange={(event) => onImageChange(event.target.files?.[0])} />
      </Button>
    </Paper>
    {uploadError && <Alert severity="warning" sx={{ mb: 2 }}>{uploadError}</Alert>}
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 900 }}>Playlist details</Typography>
        <TextField
          label="Title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          fullWidth
          size="small"
        />
      </Box>
      <TextField
        label="Description"
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        fullWidth
        size="small"
        multiline
        minRows={5}
      />
    </Stack>
  </Box>
);

export default PlaylistDetailsForm;
