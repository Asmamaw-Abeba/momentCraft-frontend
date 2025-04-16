import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Skeleton,
  IconButton,
  Tooltip,
  Checkbox,
  Avatar,
  useMediaQuery,
  useTheme,
  Collapse,
} from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShareIcon from '@mui/icons-material/Share';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Header from './Header';

// Styled Card with hover effect
const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: theme?.shadows?.[8] || '0px 8px 16px rgba(0, 0, 0, 0.2)',
  },
  borderRadius: 12,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

// Modal styles
const previewModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: { xs: 2, sm: 3 },
  borderRadius: 8,
  width: { xs: '95vw', sm: '80vw', md: '60vw' },
  maxWidth: '1000px',
  maxHeight: { xs: '95vh', sm: '90vh' },
  overflow: 'auto',
};

const BestMemories = ({ refresh }) => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [filterTimeline, setFilterTimeline] = useState('');
  const [page, setPage] = useState(1);
  const [previewMemory, setPreviewMemory] = useState(null);
  const [selectedMemories, setSelectedMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [soundOn, setSoundOn] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const memoriesPerPage = 6;

  // Navigation handlers
  const handleSoundToggle = () => setSoundOn((prev) => !prev);
  const handleExploreMemories = () => navigate('/memories');
  const handleManageFriends = () => navigate('/friends');
  const handleJoinNow = () => navigate('/register');

  // Fetch memories with user info
  useEffect(() => {
    const getMemories = async () => {
      try {
        setLoading(true);
        const { data } = await fetchMemories(token);
        setMemories(data || []);
        setFilteredMemories(data || []);
      } catch (error) {
        console.error('Error fetching memories:', error);
        toast.error('Failed to fetch memories');
      } finally {
        setLoading(false);
      }
    };
    getMemories();
  }, [refresh, token]);

  // Fetch timelines
  useEffect(() => {
    const getTimelines = async () => {
      try {
        const response = await axios.get('https://momentcraft-backend.onrender.com/api/timelines', {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        setTimelines(response.data || []);
      } catch (error) {
        console.error('Error fetching timelines:', error);
        toast.error('Failed to fetch timelines');
      }
    };
    if (token) getTimelines();
  }, [token]);

  // Filter and sort memories
  useEffect(() => {
    let result = [...memories];
    if (searchQuery) {
      result = result.filter(
        (memory) =>
          (memory.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (memory.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (memory.user?.username?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }
    if (filterTimeline) {
      result = result.filter((memory) =>
        timelines.find((t) => t._id === filterTimeline)?.memories.includes(memory._id)
      );
    }
    if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'media') {
      result.sort((a, b) => (isVideo(a.media) ? -1 : 1) - (isVideo(b.media) ? -1 : 1));
    }
    setFilteredMemories(result);
    setPage(1);
  }, [searchQuery, sortBy, filterTimeline, memories, timelines]);

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
        `https://momentcraft-backend.onrender.com/api/timelines/${timelineId}/memories/${memoryId}`,
        {},
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      const { data } = await fetchMemories(token);
      setMemories(data);
      setSelectedTimeline((prev) => ({ ...prev, [memoryId]: '' }));
      toast.success('Memory added to timeline successfully!');
    } catch (error) {
      console.error('Error adding memory to timeline:', error);
      toast.error('Failed to add memory to timeline');
    }
  };

  // Handle bulk add to timeline
  const handleBulkAddToTimeline = async () => {
    if (selectedMemories.length === 0) {
      toast.warn('Please select memories to add');
      return;
    }
    const timelineId = selectedTimeline['bulk'];
    if (!timelineId) {
      toast.warn('Please select a timeline for bulk action');
      return;
    }
    try {
      await Promise.all(
        selectedMemories.map((memoryId) =>
          axios.put(
            `https://momentcraft-backend.onrender.com/api/timelines/${timelineId}/memories/${memoryId}`,
            {},
            { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
          )
        )
      );
      const { data } = await fetchMemories(token);
      setMemories(data);
      setSelectedMemories([]);
      setSelectedTimeline((prev) => ({ ...prev, bulk: '' }));
      toast.success('Memories added to timeline successfully!');
    } catch (error) {
      console.error('Error adding memories to timeline:', error);
      toast.error('Failed to add memories to timeline');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedMemories.length === 0) {
      toast.warn('Please select memories to delete');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedMemories.length} memories?`)) {
      try {
        await Promise.all(
          selectedMemories.map((memoryId) =>
            axios.delete(`https://momentcraft-backend.onrender.com/api/memories/${memoryId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        setMemories(memories.filter((m) => !selectedMemories.includes(m._id)));
        setFilteredMemories(filteredMemories.filter((m) => !selectedMemories.includes(m._id)));
        setSelectedMemories([]);
        toast.success('Memories deleted successfully!');
      } catch (error) {
        console.error('Error deleting memories:', error);
        toast.error('Failed to delete memories');
      }
    }
  };

  // Handle video play
  const handlePlayVideo = (memoryId) => {
    setPlayingVideo(memoryId);
  };

  // Handle preview
  const handlePreview = (memory) => {
    setPreviewMemory(memory);
  };

  // Handle share
  const handleShare = (memoryId) => {
    const shareUrl = `${window.location.origin}/memory/public/${memoryId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Memory link copied to clipboard!');
  };

  // Handle selection for bulk actions
  const handleSelectMemory = (memoryId) => {
    setSelectedMemories((prev) =>
      prev.includes(memoryId) ? prev.filter((id) => id !== memoryId) : [...prev, memoryId]
    );
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setFiltersOpen((prev) => !prev);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredMemories.length / memoriesPerPage);
  const paginatedMemories = filteredMemories.slice(
    (page - 1) * memoriesPerPage,
    page * memoriesPerPage
  );

  if (loading) {
    return (
      <Box sx={{ padding: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Header
          token={token}
          onExplore={handleExploreMemories}
          onFriends={handleManageFriends}
          soundOn={soundOn}
          onSoundToggle={handleSoundToggle}
          onJoin={handleJoinNow}
        />
        <Grid container spacing={isMobile ? 2 : 3} sx={{ mt: { xs: 6, sm: 8 } }}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 12 }} />
              <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Header
        token={token}
        onExplore={handleExploreMemories}
        onFriends={handleManageFriends}
        soundOn={soundOn}
        onSoundToggle={handleSoundToggle}
        onJoin={handleJoinNow}
      />
      <Box sx={{ padding: { xs: 2, sm: 3 }, mt: { xs: 6, sm: 8 } }}>
        {/* Search, Sort, and Filter Controls */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: isMobile ? 1 : 0,
            }}
          >
            <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold' }}>
              Your Memories
            </Typography>
            {isMobile && (
              <IconButton
                onClick={toggleFilters}
                aria-label={filtersOpen ? 'Hide filters' : 'Show filters'}
                sx={{ color: '#1976d2' }}
              >
                <FilterListIcon />
              </IconButton>
            )}
          </Box>
          <Collapse in={!isMobile || filtersOpen}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
                justifyContent: 'flex-end',
                alignItems: { xs: 'stretch', sm: 'center' },
              }}
            >
              <TextField
                label="Search Memories"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ width: { xs: '100%', sm: 200 }, borderRadius: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                aria-label="Search memories"
              />
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ width: { xs: '100%', sm: 120 }, borderRadius: 1 }}
                displayEmpty
              >
                <MenuItem value="default">Sort: Default</MenuItem>
                <MenuItem value="title">Sort: Title</MenuItem>
                <MenuItem value="date">Sort: Date</MenuItem>
                <MenuItem value="media">Sort: Media Type</MenuItem>
              </Select>
              <Select
                value={filterTimeline}
                onChange={(e) => setFilterTimeline(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ width: { xs: '100%', sm: 120 }, borderRadius: 1 }}
                displayEmpty
              >
                <MenuItem value="">All Timelines</MenuItem>
                {timelines.map((timeline) => (
                  <MenuItem key={timeline._id} value={timeline._id}>
                    {timeline.name}
                  </MenuItem>
                ))}
              </Select>
              {selectedMemories.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                  <Tooltip title="Add Selected Memories">
                    <IconButton color="primary" onClick={handleBulkAddToTimeline}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Selected Memories">
                    <IconButton color="error" onClick={handleBulkDelete}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </Collapse>
        </Box>

        <Fade in={!loading}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="body1" color="textSecondary">
              Browse and organize your cherished moments
            </Typography>
          </Box>
        </Fade>

        {filteredMemories.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Typography variant="h6" color="textSecondary">
              {searchQuery || filterTimeline ? 'No matching memories found.' : 'No memories available yet.'}
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
              Start capturing moments to see them here!
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={isMobile ? 2 : 3}>
              {paginatedMemories.map((memory) => (
                <Grid item key={memory._id} xs={12} sm={6} md={4}>
                  <StyledCard>
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
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
                                onClick={() => handlePreview(memory)}
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
                                  cursor: 'pointer',
                                }}
                                onClick={() => handlePreview(memory)}
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
                                cursor: 'pointer',
                              }}
                              onClick={() => handlePreview(memory)}
                              onError={(e) => console.error('Image failed to load:', e)}
                            />
                          </Box>
                        )
                      )}
                      <Checkbox
                        checked={selectedMemories.includes(memory._id)}
                        onChange={() => handleSelectMemory(memory._id)}
                        sx={{ position: 'absolute', top: 8, left: 8 }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar
                          sx={{ width: 24, height: 24, bgcolor: '#1976d2' }}
                          alt={memory.user?.username || 'Unknown'}
                          src={memory.user?.avatar}
                        >
                          {memory.user?.username?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                        <Typography
                          variant="body2"
                          component={Link}
                          to={`/profile/${memory.user?._id}`}
                          sx={{ color: '#1976d2', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          {memory.user?.username || 'Unknown User'}
                        </Typography>
                      </Box>
                      <Typography variant={isMobile ? 'body1' : 'h6'} sx={{ fontWeight: 'medium' }}>
                        {memory.title || 'Untitled'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
                        {memory.description || 'No description'}
                      </Typography>
                      {!isVideo(memory.media) && (
                        <Typography variant="caption" sx={{ mt: 1, fontStyle: 'italic', display: 'block' }}>
                          <strong>{'>>'}</strong> {memory.caption || 'No caption available.'}
                        </Typography>
                      )}
                      {isVideo(memory.media) && (
                        <Typography variant="caption" sx={{ mt: 1, fontStyle: 'italic', display: 'block' }}>
                          <strong>{'>>'}</strong> {memory.summary || 'No summary available.'}
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        <VisibilityIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {memory.visibility === 'private' ? 'Private' : memory.visibility === 'friends' ? 'Friends Only' : 'Public'}
                      </Typography>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  size={isMobile ? 'small' : 'large'}
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Preview Modal */}
      <Modal open={!!previewMemory} onClose={() => setPreviewMemory(null)} closeAfterTransition>
        <Fade in={!!previewMemory}>
          <Box sx={previewModalStyle}>
            {previewMemory && (
              isVideo(previewMemory.media) ? (
                <video
                  controls
                  autoPlay
                  style={{
                    width: '100%',
                    maxWidth: { xs: '90vw', sm: '80vw' },
                    maxHeight: { xs: '80vh', sm: '70vh' },
                    objectFit: 'contain',
                    display: 'block',
                    margin: 'auto',
                  }}
                >
                  <source src={previewMemory.media} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={previewMemory.media || 'https://via.placeholder.com/300'}
                  alt={previewMemory.title}
                  style={{
                    width: '100%',
                    maxWidth: { xs: '90vw', sm: '80vw' },
                    maxHeight: { xs: '80vh', sm: '70vh' },
                    objectFit: 'contain',
                    display: 'block',
                    margin: 'auto',
                  }}
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/300')}
                />
              )
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default BestMemories;