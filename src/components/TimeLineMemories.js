import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Container,
  Fade,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  IconButton as MuiIconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import AuthContext from '../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';

// Styled Card with hover effect
const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme?.shadows?.[10] || '0px 10px 20px rgba(0, 0, 0, 0.2)',
  },
  borderRadius: 12,
  overflow: 'hidden',
}));

// Styled AppBar for sticky header
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
  boxShadow: theme?.shadows?.[4] || '0px 4px 10px rgba(0, 0, 0, 0.1)',
  padding: '0 16px',
}));

const TimelineMemories = () => {
  const { timelineId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [timeline, setTimeline] = useState(null);
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const memoriesPerPage = 6;

  // Fetch timeline and memories
  useEffect(() => {
    fetchTimeline();
  }, [timelineId, token]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5000/api/timelines/${timelineId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setTimeline(data);
      setMemories(data.memories || []);
      setFilteredMemories(data.memories || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort memories
  useEffect(() => {
    let result = [...memories];
    if (searchQuery) {
      result = result.filter(
        (memory) =>
          memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memory.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setFilteredMemories(result);
    setPage(1);
  }, [searchQuery, sortBy, memories]);

  // Handle drag-and-drop reordering
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedMemories = Array.from(filteredMemories);
    const [movedMemory] = reorderedMemories.splice(result.source.index, 1);
    reorderedMemories.splice(result.destination.index, 0, movedMemory);

    setFilteredMemories(reorderedMemories);
    setMemories(reorderedMemories);

    try {
      await axios.put(
        `http://localhost:5000/api/timelines/${timelineId}/reorder`,
        { memoryIds: reorderedMemories.map((m) => m._id) },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Memories reordered successfully!');
    } catch (error) {
      console.error('Error reordering memories:', error);
      setError('Failed to save new order');
      toast.error('Failed to save new order');
    }
  };

  // Handle deleting a memory
  const handleDeleteMemory = async (memoryId) => {
    if (window.confirm('Are you sure you want to remove this memory from the timeline?')) {
      try {
        await axios.delete(`http://localhost:5000/api/timelines/${timelineId}/memories/${memoryId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        setMemories((prev) => prev.filter((m) => m._id !== memoryId));
        setFilteredMemories((prev) => prev.filter((m) => m._id !== memoryId));
        toast.success('Memory removed successfully!');
      } catch (error) {
        console.error('Error deleting memory:', error);
        setError('Failed to delete memory');
        toast.error('Failed to delete memory');
      }
    }
  };

  // Check if media is a video
  const isVideo = (media) => {
    if (!media) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some((ext) => media.toLowerCase().endsWith(ext));
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredMemories.length / memoriesPerPage);
  const paginatedMemories = filteredMemories.slice(
    (page - 1) * memoriesPerPage,
    page * memoriesPerPage
  );

  // Share timeline
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/timeline/public/${timelineId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Timeline link copied to clipboard!');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress aria-label="Loading memories" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button variant="contained" color="primary" onClick={fetchTimeline} sx={{ mt: 2, mr: 2 }}>
          Retry
        </Button>
        <Button variant="outlined" onClick={() => navigate('/timelines')} sx={{ mt: 2 }}>
          Back to Timelines
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Sticky Smart Header */}
      <StyledAppBar position="sticky">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Back to Timelines">
              <MuiIconButton
                color="inherit"
                onClick={() => navigate('/timelines')}
                edge="start"
                aria-label="Back to timelines"
              >
                <ArrowBackIcon />
              </MuiIconButton>
            </Tooltip>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: '#fff',
                maxWidth: { xs: '150px', sm: '300px', md: '500px' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {timeline?.name || 'Timeline Memories'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Add New Memory">
              <MuiIconButton
                color="inherit"
                component={Link}
                to={`/memories`}
                aria-label="Add new memory to timeline"
              >
                <AddIcon />
              </MuiIconButton>
            </Tooltip>
            <Tooltip title="Share Timeline">
              <MuiIconButton
                color="inherit"
                onClick={handleShare}
                aria-label="Share timeline link"
              >
                <ShareIcon />
              </MuiIconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Subheader with Description and Created Date */}
        <Fade in={!loading}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
              {timeline?.description || 'Relive your moments'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Created: {timeline?.createdAt ? new Date(timeline.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>
        </Fade>

        {/* Search and Sort Bar */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
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
            inputProps={{ 'aria-label': 'Search memories' }}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            variant="outlined"
            sx={{ minWidth: 120 }}
            aria-label="Sort memories"
          >
            <MenuItem value="default">Default Order</MenuItem>
            <MenuItem value="title">Sort by Title</MenuItem>
            <MenuItem value="date">Sort by Date</MenuItem>
          </Select>
        </Box>

        {/* Memories Section */}
        {filteredMemories.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Typography variant="h6" color="textSecondary">
              {searchQuery ? 'No matching memories found.' : 'No memories in this timeline yet.'}
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
              Start adding memories to bring your timeline to life!
            </Typography>
          </Box>
        ) : (
          <>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="memories" direction="vertical">
                {(provided) => (
                  <Grid
                    container
                    spacing={3}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {paginatedMemories.map((memory, index) => (
                      <Draggable key={memory._id} draggableId={memory._id} index={index}>
                        {(provided) => (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <StyledCard>
                              {memory.media && (
                                <CardMedia
                                  component={isVideo(memory.media) ? 'video' : 'img'}
                                  src={memory.media}
                                  controls={isVideo(memory.media)}
                                  autoPlay={false}
                                  muted={false}
                                  sx={{
                                    maxHeight: { xs: '40vh', sm: '50vh', md: '60vh' },
                                    width: '100%',
                                    objectFit: 'contain',
                                    borderRadius: '12px 12px 0 0',
                                  }}
                                  alt={memory.title || 'Memory preview'}
                                  onError={(e) => {
                                    console.error('Media failed to load:', e);
                                    e.target.src = 'https://via.placeholder.com/300?text=Media+Not+Found';
                                  }}
                                />
                              )}
                              <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                                  {memory.title || 'Untitled'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {memory.description || 'No description'}
                                </Typography>
                                {memory.caption && !isVideo(memory.media) && (
                                  <Typography variant="caption" sx={{ mt: 1, fontStyle: 'italic', display: 'block' }}>
                                    <strong>AI Caption:</strong> {memory.caption}
                                  </Typography>
                                )}
                                {memory.summary && isVideo(memory.media) && (
                                  <Typography variant="caption" sx={{ mt: 1, fontStyle: 'italic', display: 'block' }}>
                                    <strong>AI Summary:</strong> {memory.summary}
                                  </Typography>
                                )}
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                  <Tooltip title="Remove memory from timeline">
                                    <IconButton
                                      onClick={() => handleDeleteMemory(memory._id)}
                                      color="error"
                                      sx={{ p: 1 }}
                                      aria-label={`Delete memory ${memory.title || 'Untitled'}`}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </CardContent>
                            </StyledCard>
                          </Grid>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Grid>
                )}
              </Droppable>
            </DragDropContext>
            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  size="large"
                  aria-label="Memory pagination"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default TimelineMemories;