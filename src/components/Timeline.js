import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Fade,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/system';
import AuthContext from '../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

// Styled Card with hover effect
const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: theme.shadows[8],
  },
  borderRadius: 12,
  overflow: 'hidden',
}));

const Timeline = () => {
  const [timelines, setTimelines] = useState([]);
  const [filteredTimelines, setFilteredTimelines] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newTimelineName, setNewTimelineName] = useState('');
  const [newTimelineDescription, setNewTimelineDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const timelinesPerPage = 6; // Adjustable
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch all timelines for the user
  useEffect(() => {
    const fetchTimelines = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/timelines', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        setTimelines(data || []);
        setFilteredTimelines(data || []);
      } catch (error) {
        console.error('Error fetching timelines:', error);
      }
    };
    fetchTimelines();
  }, [token]);

  // Filter timelines based on search query
  useEffect(() => {
    const filtered = timelines.filter((timeline) =>
      timeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      timeline.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTimelines(filtered);
    setPage(1); // Reset to first page on search
  }, [searchQuery, timelines]);

  // Handle creating a new timeline
  const handleCreateTimeline = async () => {
    if (!newTimelineName.trim()) {
      alert('Timeline name is required');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:5000/api/timelines',
        { name: newTimelineName, description: newTimelineDescription },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTimelines((prev) => [...prev, response.data]);
      setNewTimelineName('');
      setNewTimelineDescription('');
      setOpenCreateDialog(false);
    } catch (error) {
      console.error('Error creating timeline:', error);
      alert('Failed to create timeline');
    }
  };

  // Handle deleting a timeline
  const handleDeleteTimeline = async (timelineId) => {
    if (window.confirm('Are you sure you want to delete this timeline?')) {
      try {
        await axios.delete(`http://localhost:5000/api/timelines/${timelineId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTimelines((prev) => prev.filter((t) => t._id !== timelineId));
      } catch (error) {
        console.error('Error deleting timeline:', error);
        // alert('Failed to delete timeline');
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredTimelines.length / timelinesPerPage);
  const paginatedTimelines = filteredTimelines.slice(
    (page - 1) * timelinesPerPage,
    page * timelinesPerPage
  );

  // Check if media is a video
  const isVideo = (media) => {
    if (!media) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some((ext) => media.toLowerCase().endsWith(ext));
  };

  return (
    <Box sx={{ padding: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
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
            Your Timelines
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            Organize and relive your memories
          </Typography>
        </Box>
      </Fade>

      {/* Search and Create */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField
          label="Search Timelines"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{ maxWidth: { sm: 300 }, width: '100%' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenCreateDialog(true)}
          sx={{ px: 4, py: 1.5, borderRadius: 20 }}
        >
          Create New Timeline
        </Button>
      </Box>

      {/* Timelines Grid */}
      {filteredTimelines.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h6" color="textSecondary">
            {searchQuery ? 'No matching timelines found.' : 'No timelines yet.'}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            Create a timeline to start adding memories!
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedTimelines.map((timeline) => (
              <Grid item xs={12} sm={6} md={4} key={timeline._id}>
                <StyledCard>
                  {/* Preview first memory image/video if available */}
                  {timeline.memories.length > 0 && timeline.memories[0].media && (
                    <CardMedia
                      component={timeline.memories[0].media.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'img'}
                      // src={`http://localhost:5000/${timeline.memories[0].media}`}
                      src={isVideo(timeline.memories[0].media) ? `${timeline.memories[0].media}` : `http://localhost:5000/${timeline.memories[0].media}`}
                      controls={timeline.memories[0].media.match(/\.(mp4|webm|ogg)$/) }
                      sx={{ height: 150, objectFit: 'cover' }}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                      {timeline.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {timeline.description || 'No description provided'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Memories: {timeline.memories.length}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Created: {new Date(timeline.createdAt).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Button
                          component={Link}
                          to={`/timelines/${timeline._id}`}
                          variant="outlined"
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          View Memories
                        </Button>
                        <Button
                          onClick={() => navigate(`/add-memory/${timeline._id}`)}
                          variant="contained"
                          color="secondary"
                        >
                          Add Memory
                        </Button>
                      </Box>
                      <IconButton
                        onClick={() => handleDeleteTimeline(timeline._id)}
                        color="error"
                        sx={{ p: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
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

      {/* Create Timeline Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create a New Timeline</DialogTitle>
        <DialogContent>
          <TextField
            label="Timeline Name"
            value={newTimelineName}
            onChange={(e) => setNewTimelineName(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Description"
            value={newTimelineDescription}
            onChange={(e) => setNewTimelineDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateTimeline} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Timeline;