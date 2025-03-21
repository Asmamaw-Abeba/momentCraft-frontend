import React, { useState, useEffect, useContext } from 'react';
import { fetchMemories } from '../api';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  TextField,
  InputAdornment,
  Fade,
  Modal,
  Backdrop,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styled Card with hover effect
const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: theme?.shadows?.[8] || '0px 8px 16px rgba(0, 0, 0, 0.2)',
  },
  borderRadius: 12,
  overflow: 'hidden',
}));

// Modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 8,
};

const MemoryList = ({ refresh }) => {
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editMemory, setEditMemory] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMedia, setEditMedia] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState({});
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const memoriesPerPage = 6;
  const { token } = useContext(AuthContext);

  // Fetch memories
  useEffect(() => {
    const getMemories = async () => {
      try {
        const { data } = await fetchMemories();
        setMemories(data || []);
        setFilteredMemories(data || []);
      } catch (error) {
        console.error('Error fetching memories:', error);
        toast.error('Failed to fetch memories');
      }
    };
    getMemories();
  }, [refresh]);

  // Fetch timelines
  useEffect(() => {
    const getTimelines = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/timelines', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        setTimelines(response.data || []);
      } catch (error) {
        console.error('Error fetching timelines:', error);
        toast.error('Failed to fetch timelines');
      }
    };
    getTimelines();
  }, [token]);

  // Filter memories based on search query
  useEffect(() => {
    const filtered = memories.filter(
      (memory) =>
        (memory.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (memory.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
    setFilteredMemories(filtered);
    setPage(1);
  }, [searchQuery, memories]);

  // Check if a file is a video
  const isVideo = (filename) => {
    if (!filename) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  // Extract public_id from video URL
  const getPublicId = (videoUrl) => {
    const urlWithoutQuery = videoUrl.split('?')[0];
    const uploadIndex = urlWithoutQuery.indexOf('/upload/');
    if (uploadIndex === -1) return null;
    const afterUpload = urlWithoutQuery.substring(uploadIndex + 8);
    const lastDotIndex = afterUpload.lastIndexOf('.');
    if (lastDotIndex === -1) return afterUpload;
    return afterUpload.substring(0, lastDotIndex);
  };

  // Generate thumbnail URL from video URL
  const getThumbnailUrl = (videoUrl) => {
    const publicId = getPublicId(videoUrl);
    if (!publicId) return null;
    return `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/video/upload/w_300,h_300,c_fill,so_1,f_jpg/${publicId}.jpg`;
  };

  // Handle adding a memory to a timeline
  const handleAddToTimeline = async (memoryId) => {
    const timelineId = selectedTimeline[memoryId];
    if (!timelineId) {
      toast.warn('Please select a timeline');
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/timelines/${timelineId}/memories/${memoryId}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { data } = await fetchMemories();
      setMemories(data);
      setSelectedTimeline((prev) => ({ ...prev, [memoryId]: '' }));
      toast.success('Memory added to timeline successfully!');
    } catch (error) {
      console.error('Error adding memory to timeline:', error);
      toast.error('Failed to add memory to timeline');
    }
  };

  // Handle timeline selection change
  const handleTimelineChange = (memoryId, event) => {
    setSelectedTimeline((prev) => ({
      ...prev,
      [memoryId]: event.target.value,
    }));
  };

  // Handle delete
  const handleDelete = async (memoryId) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      setLoadingDelete((prev) => ({ ...prev, [memoryId]: true }));
      try {
        await axios.delete(`http://localhost:5000/api/memories/${memoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMemories(memories.filter((m) => m._id !== memoryId));
        setFilteredMemories(filteredMemories.filter((m) => m._id !== memoryId));
        toast.success('Memory deleted successfully!');
      } catch (error) {
        console.error('Error deleting memory:', error);
        toast.error('Failed to delete memory');
      } finally {
        setLoadingDelete((prev) => ({ ...prev, [memoryId]: false }));
      }
    }
  };

  // Handle edit
  const openEditModal = (memory) => {
    setEditMemory(memory);
    setEditTitle(memory.title || '');
    setEditDescription(memory.description || '');
    setEditMedia(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoadingEdit(true);
    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('description', editDescription);
    if (editMedia) formData.append('media', editMedia);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/memories/${editMemory._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedMemory = response.data;
      setMemories(memories.map((m) => (m._id === updatedMemory._id ? updatedMemory : m)));
      setFilteredMemories(
        filteredMemories.map((m) => (m._id === updatedMemory._id ? updatedMemory : m))
      );
      setEditMemory(null);
      toast.success('Memory updated successfully!');
    } catch (error) {
      console.error('Error editing memory:', error);
      toast.error('Failed to edit memory');
    } finally {
      setLoadingEdit(false);
    }
  };

  // Handle video play
  const handlePlayVideo = (memoryId) => {
    setPlayingVideo(memoryId);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredMemories.length / memoriesPerPage);
  const paginatedMemories = filteredMemories.slice(
    (page - 1) * memoriesPerPage,
    page * memoriesPerPage
  );

  return (
    <Box sx={{ padding: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Header */}
      <Fade in>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #0288d1, #26c6da)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your Memories
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            Browse and organize your cherished moments
          </Typography>
        </Box>
      </Fade>

      {/* Search Bar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <TextField
          label="Search Memories"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{ maxWidth: 400, width: '100%' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Memories Grid */}
      {filteredMemories.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h6" color="textSecondary">
            {searchQuery ? 'No matching memories found.' : 'No memories available yet.'}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            Start capturing moments to see them here!
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedMemories.map((memory) => (
              <Grid item key={memory._id} xs={12} sm={6} md={4}>
                <StyledCard>
                  {memory.media && (
                    isVideo(memory.media) ? (
                      playingVideo === memory._id ? (
                        <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                          <video
                            controls
                            autoPlay
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              backgroundColor: '#000',
                            }}
                            onEnded={() => setPlayingVideo(null)}
                          >
                            <source src={memory.media} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </Box>
                      ) : (
                        <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                          <img
                            src={getThumbnailUrl(memory.media)}
                            alt={memory.title}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              backgroundColor: '#000',
                            }}
                          />
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              color: 'white',
                              bgcolor: 'rgba(0, 0, 0, 0.5)',
                              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                            }}
                            onClick={() => handlePlayVideo(memory._id)}
                          >
                            <PlayArrowIcon fontSize="large" />
                          </IconButton>
                        </Box>
                      )
                    ) : (
                      <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                        <img
                          src={memory.media}
                          alt={memory.title}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            backgroundColor: '#000',
                          }}
                          onError={(e) => console.error('Image failed to load:', e)}
                        />
                      </Box>
                    )
                  )}
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                      {memory.title || 'Untitled'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {memory.description || 'No description'}
                    </Typography>
                    {!isVideo(memory.media) && (
                      <Typography
                        variant="caption"
                        sx={{ mt: 1, fontStyle: 'italic', display: 'block' }}
                      >
                        <strong>AI Caption:</strong> {memory.caption || 'No caption available.'}
                      </Typography>
                    )}
                    {isVideo(memory.media) && (
                      <Typography
                        variant="caption"
                        sx={{ mt: 1, fontStyle: 'italic', display: 'block' }}
                      >
                        <strong>AI Caption:</strong> {memory.caption || 'No caption available.'}
                      </Typography>
                    )}
                    {/* Timeline Selection */}
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel id={`timeline-select-label-${memory._id}`}>
                        Add to Timeline
                      </InputLabel>
                      <Select
                        labelId={`timeline-select-label-${memory._id}`}
                        value={selectedTimeline[memory._id] || ''}
                        label="Add to Timeline"
                        onChange={(e) => handleTimelineChange(memory._id, e)}
                      >
                        <MenuItem value="">None</MenuItem>
                        {timelines.map((timeline) => (
                          <MenuItem key={timeline._id} value={timeline._id}>
                            {timeline.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddToTimeline(memory._id)}
                        sx={{ borderRadius: 20, px: 3 }}
                      >
                        Add to Timeline
                      </Button>
                      <Tooltip title="Edit Memory">
                        <IconButton
                          color="primary"
                          onClick={() => openEditModal(memory)}
                          disabled={loadingDelete[memory._id]}
                        >
                          {loadingDelete[memory._id] ? (
                            <CircularProgress size={24} />
                          ) : (
                            <EditIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Memory">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(memory._id)}
                          disabled={loadingDelete[memory._id]}
                        >
                          {loadingDelete[memory._id] ? (
                            <CircularProgress size={24} />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Edit Modal */}
      <Modal
        open={!!editMemory}
        onClose={() => setEditMemory(null)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={!!editMemory}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Edit Memory
            </Typography>
            <form onSubmit={handleEditSubmit}>
              <TextField
                label="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                disabled={loadingEdit}
              />
              <TextField
                label="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 2 }}
                disabled={loadingEdit}
              />
              <TextField
                type="file"
                onChange={(e) => setEditMedia(e.target.files[0])}
                fullWidth
                sx={{ mb: 2 }}
                inputProps={{ accept: 'image/*,video/*' }}
                disabled={loadingEdit}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loadingEdit}
                  startIcon={loadingEdit ? <CircularProgress size={20} /> : null}
                >
                  {loadingEdit ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditMemory(null)}
                  disabled={loadingEdit}
                >
                  Cancel
                </Button>
              </Box>
            </form>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default MemoryList;