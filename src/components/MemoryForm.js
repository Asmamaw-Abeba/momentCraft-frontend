import React, { useState, useContext } from 'react';
import { createMemory } from '../api';
import { TextField, Button, Box, Typography, Snackbar, Alert, LinearProgress } from '@mui/material';
import AuthContext from '../context/AuthContext';

const MemoryForm = ({ onMemoryCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only images (JPEG, PNG, GIF) and videos (MP4, WebM, Ogg) are allowed.');
      setOpenSnackbar(true);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('media', file);

    try {
      setIsLoading(true); // Show loading state
      await createMemory(formData, (progress) => setUploadProgress(progress), token);
      alert('Memory created!');
      // Clear form fields
      setTitle('');
      setDescription('');
      setFile(null);
      setUploadProgress(0);
      // Notify parent component to refresh memories
      onMemoryCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create memory');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ maxWidth: 500, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create a Memory
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={4}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ margin: '20px 0' }}
          required
        />
        {uploadProgress > 0 && (
          <LinearProgress variant="determinate" value={uploadProgress} sx={{ marginBottom: 2 }} />
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? 'Uploading...' : 'Upload Memory'}
        </Button>
      </form>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MemoryForm;