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
} from '@mui/material';
import { styled } from '@mui/system';
import AuthContext from '../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const memoriesPerPage = 6; // Adjustable

  // Fetch timeline and memories
  useEffect(() => {
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
    fetchTimeline();
  }, [timelineId, token]);

  // Filter memories based on search query
  useEffect(() => {
    const filtered = memories.filter((memory) =>
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMemories(filtered);
    setPage(1); // Reset to first page on search
  }, [searchQuery, memories]);

  // Handle drag-and-drop reordering
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedMemories = Array.from(filteredMemories);
    const [movedMemory] = reorderedMemories.splice(result.source.index, 1);
    reorderedMemories.splice(result.destination.index, 0, movedMemory);

    setFilteredMemories(reorderedMemories);
    setMemories(reorderedMemories); // Sync with full list

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
    } catch (error) {
      console.error('Error reordering memories:', error);
      setError('Failed to save new order');
    }
  };

  // Handle deleting a memory from the timeline
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
      } catch (error) {
        console.error('Error deleting memory:', error);
        setError('Failed to delete memory');
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button onClick={() => navigate('/timelines')} sx={{ mt: 2 }}>
          Back to Timelines
        </Button>
      </Box>
    );
  }

  

  return (
    <Container maxWidth="lg" sx={{ py: 5, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Fade in={!loading}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {timeline?.name || 'Timeline Memories'}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            {timeline?.description || 'Relive your moments'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Created: {timeline?.createdAt ? new Date(timeline.createdAt).toLocaleDateString() : 'N/A'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`/add-memory/${timelineId}`}
            sx={{ mt: 3, px: 4, py: 1.5, borderRadius: 20 }}
          >
            Add New Memory
          </Button>
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
                                // src={`http://localhost:5000/${memory.media}`}
                                src={isVideo(memory.media) ? `${memory.media}` : `http://localhost:5000/${memory.media}`}
                                controls={isVideo(memory.media)}
                                autoPlay={false}
                                muted={false}
                                sx={{ height: 200, objectFit: 'cover' }}
                                onError={(e) => console.error('Media failed to load:', e)}
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
                                <Typography variant="caption" sx={{ mt: 1, fontStyle: 'italic' }}>
                                  <strong>AI Caption:</strong> {memory.caption}
                                </Typography>
                              )}
                              {memory.summary && isVideo(memory.media) && (
                                <Typography variant="caption" sx={{ mt: 1, fontStyle: 'italic' }}>
                                  <strong>AI Summary:</strong> {memory.summary}
                                </Typography>
                              )}
                              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <IconButton
                                  onClick={() => handleDeleteMemory(memory._id)}
                                  color="error"
                                  sx={{ p: 1 }}
                                >
                                  <DeleteIcon />
                                </IconButton>
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
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default TimelineMemories;