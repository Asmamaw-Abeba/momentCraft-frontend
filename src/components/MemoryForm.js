import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMemory } from '../api';
import {
  TextField,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import CancelIcon from '@mui/icons-material/Cancel';
import AuthContext from '../context/AuthContext';
import Header from './Header'; // Import Header component
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Styled Components
const StyledBox = styled(Box)(({ theme }) => ({
  maxWidth: 600,
  margin: 'auto',
  padding: theme.spacing(3),
  backgroundColor: '#fff',
  borderRadius: 12,
  boxShadow: theme.shadows[4],
  mt: 8, // Adjusted for Header
}));

const DropZone = styled(Box)(({ theme, isDragging }) => ({
  border: `2px dashed ${isDragging ? '#1976d2' : '#ccc'}`,
  borderRadius: 8,
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: isDragging ? '#e3f2fd' : '#fafafa',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  '&:hover': {
    transform: 'scale(1.05)',
    transition: 'transform 0.2s ease',
  },
}));

const MemoryForm = ({ onMemoryCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [visibility, setVisibility] = useState('private'); // New visibility state
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // For drag-and-drop
  const [previewUrl, setPreviewUrl] = useState(null); // For file preview
  const [soundOn, setSoundOn] = useState(false); // For Header
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Navigation handlers for Header
  const handleSoundToggle = () => setSoundOn((prev) => !prev);
  const handleExploreMemories = () => navigate('/memories');
  const handleManageFriends = () => navigate('/friends');
  const handleJoinNow = () => navigate('/register');

  // Handle file selection (input or drop)
  const handleFileChange = useCallback((selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only images (JPEG, PNG, GIF) and videos (MP4, WebM, Ogg) are allowed.');
      setOpenSnackbar(true);
      return;
    }
    if (selectedFile.size > maxSize) {
      setError('File size exceeds 50MB limit.');
      setOpenSnackbar(true);
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile)); // Generate preview
    setError('');
  }, []);

  // Drag-and-drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required.');
      setOpenSnackbar(true);
      return;
    }
    if (!file) {
      setError('Please upload a file.');
      setOpenSnackbar(true);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('media', file);
    formData.append('visibility', visibility); // Add visibility to form data

    try {
      setIsLoading(true);
      await createMemory(formData, (progress) => setUploadProgress(progress), token);
      setTitle('');
      setDescription('');
      setFile(null);
      setPreviewUrl(null);
      setVisibility('private');
      setUploadProgress(0);
      onMemoryCreated();
      toast.success('Memory created successfully!'); // Replace alert with toast
      navigate('/memories');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create memory');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and navigate back
  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setPreviewUrl(null);
    setVisibility('private');
    navigate('/memories');
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Header
        token={token}
        onExplore={handleExploreMemories}
        onFriends={handleManageFriends}
        soundOn={soundOn}
        onSoundToggle={handleSoundToggle}
        onJoin={handleJoinNow}
      />
      <StyledBox>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
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
            variant="outlined"
            error={title.length > 50}
            helperText={title.length > 50 ? 'Title must be 50 characters or less' : ''}
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            variant="outlined"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Visibility</InputLabel>
            <Select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              label="Visibility"
            >
              <MenuItem value="private">Private (Only Me)</MenuItem>
              <MenuItem value="friends">Friends Only</MenuItem>
              <MenuItem value="public">Public</MenuItem>
            </Select>
          </FormControl>

          {/* File Input with Drag-and-Drop */}
          <DropZone
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            isDragging={isDragging}
            onClick={() => document.getElementById('file-input').click()}
          >
            {previewUrl ? (
              <Box sx={{ position: 'relative', maxHeight: 200, overflow: 'hidden' }}>
                {file.type.startsWith('video/') ? (
                  <video
                    src={previewUrl}
                    controls
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                )}
                <Tooltip title="Remove File">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    <CancelIcon color="error" />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Typography color={isDragging ? 'primary' : 'textSecondary'}>
                {isDragging ? 'Drop file here!' : 'Drag & drop or click to upload a file'}
              </Typography>
            )}
            <input
              id="file-input"
              type="file"
              onChange={(e) => handleFileChange(e.target.files[0])}
              style={{ display: 'none' }}
              accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/ogg"
            />
          </DropZone>

          {uploadProgress > 0 && (
            <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2, mb: 2 }} />
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <StyledButton
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </StyledButton>
            <StyledButton
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !title.trim() || !file}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Upload Memory'}
            </StyledButton>
          </Box>
        </form>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </StyledBox>
    </Box>
  );
};

export default MemoryForm;