import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Fade,
  Tooltip,
  MenuItem,
  Select,
  Pagination,
  AppBar,
  Toolbar,
  Skeleton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Share as ShareIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { styled } from '@mui/system';
import Carousel from 'react-material-ui-carousel';
import AuthContext from '../context/AuthContext';

// Styled Card with hover effect
const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: theme.shadows[6],
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

const Timeline = () => {
  const [timelines, setTimelines] = useState([]);
  const [filteredTimelines, setFilteredTimelines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTimelineName, setNewTimelineName] = useState('');
  const [newTimelineDescription, setNewTimelineDescription] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [timelineToDelete, setTimelineToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [maxThumbnails, setMaxThumbnails] = useState(3); // Dynamic thumbnail limit
  const timelinesPerPage = 6;
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchTimelines();
  }, []);

  const fetchTimelines = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/timelines', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setTimelines(response.data);
      setFilteredTimelines(response.data);
    } catch (error) {
      console.error('Error fetching timelines:', error);
      setError('Failed to load timelines. Please try again.');
      toast.error('Failed to load timelines');
    } finally {
      setLoading(false);
    }
  };

  // Handle search and sort
  const handleSearchAndSort = () => {
    let result = [...timelines];
    if (searchQuery) {
      result = result.filter((timeline) =>
        timeline.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'memories') {
      result.sort((a, b) => b.memories.length - a.memories.length);
    } else if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }
    setFilteredTimelines(result);
    setPage(1);
  };

  useEffect(() => {
    handleSearchAndSort();
  }, [searchQuery, sortBy, timelines]);

  const handleCreateTimeline = async () => {
    if (!newTimelineName.trim()) {
      toast.error('Timeline name is required');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:5000/api/timelines',
        {
          name: newTimelineName,
          description: newTimelineDescription,
        },
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
      toast.success('Timeline created successfully!');
    } catch (error) {
      console.error('Error creating timeline:', error);
      toast.error('Failed to create timeline');
    }
  };

  const handleDeleteTimeline = async () => {
    if (!timelineToDelete) return;
    try {
      await axios.delete(`http://localhost:5000/api/timelines/${timelineToDelete._id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setTimelines((prev) => prev.filter((t) => t._id !== timelineToDelete._id));
      setOpenDeleteDialog(false);
      setTimelineToDelete(null);
      toast.success('Timeline deleted successfully!');
    } catch (error) {
      console.error('Error deleting timeline:', error);
      toast.error('Failed to delete timeline');
    }
  };

  const handleOpenDeleteDialog = (timeline) => {
    setTimelineToDelete(timeline);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setTimelineToDelete(null);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchTimelines();
  };

  const handleShareAll = () => {
    const shareUrl = `${window.location.origin}/api/timelines`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Timelines page link copied to clipboard!');
  };

  // Pagination logic
  const paginatedTimelines = filteredTimelines.slice(
    (page - 1) * timelinesPerPage,
    page * timelinesPerPage
  );
  const totalPages = Math.ceil(filteredTimelines.length / timelinesPerPage);

  if (loading) {
    return (
      <Box sx={{ padding: { xs: 2, sm: 3, md: 4 }, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 12 }} />
              <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRetry}
          sx={{ mt: 2 }}
          aria-label="Retry loading timelines"
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sticky Header */}
      <StyledAppBar position="sticky">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
            Timelines
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Search Timelines"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: { xs: '150px', sm: '200px' }, background: '#fff', borderRadius: 1 }}
              size="small"
              inputProps={{ 'aria-label': 'Search timelines by name' }}
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              variant="outlined"
              sx={{ minWidth: 120, background: '#fff', borderRadius: 1 }}
              size="small"
              aria-label="Sort timelines"
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="memories">Memories</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </Select>
            <Select
              value={maxThumbnails}
              onChange={(e) => setMaxThumbnails(e.target.value)}
              variant="outlined"
              sx={{ minWidth: 80, background: '#fff', borderRadius: 1 }}
              size="small"
              aria-label="Set maximum thumbnails"
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={5}>5</MenuItem>
            </Select>
            <Tooltip title="Create New Timeline">
              <IconButton
                color="inherit"
                onClick={() => setOpenCreateDialog(true)}
                aria-label="Create new timeline"
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share All Timelines">
              <IconButton
                color="inherit"
                onClick={handleShareAll}
                aria-label="Share all timelines link"
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Main Content */}
      <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
        <Fade in={filteredTimelines.length > 0}>
          <Grid container spacing={3}>
            {paginatedTimelines.map((timeline, index) => (
              <Grid item xs={12} sm={6} md={4} key={timeline._id}>
                <Fade in timeout={300 + index * 100}>
                  <StyledCard>
                    {timeline.memories.length > 0 ? (
                      <Carousel
                        autoPlay={false}
                        navButtonsAlwaysVisible
                        indicators
                        sx={{ height: { xs: 120, sm: 150, md: 180 } }}
                        aria-label={`Preview of ${timeline.name || 'Untitled'} timeline`}
                      >
                        {timeline.memories.slice(0, maxThumbnails).map((memory) => (
                          <CardMedia
                            key={memory._id}
                            component={memory.media.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'img'}
                            src={memory.media}
                            controls={memory.media.match(/\.(mp4|webm|ogg)$/)}
                            sx={{
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            alt={memory.title || 'Timeline memory preview'}
                            onError={(e) => (e.target.src = 'https://via.placeholder.com/150?text=No+Preview')}
                          />
                        ))}
                      </Carousel>
                    ) : (
                      <Box
                        sx={{
                          height: { xs: 120, sm: 150, md: 180 },
                          bgcolor: '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography color="textSecondary">No Preview Available</Typography>
                      </Box>
                    )}
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {timeline.name || 'Untitled'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {timeline.description || 'No description'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Memories: {timeline.memories.length}
                      </Typography>
                      {timeline.updatedAt && (
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                          Last Updated: {new Date(timeline.updatedAt).toLocaleDateString()}
                        </Typography>
                      )}
                      <Box
                        sx={{
                          mt: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Tooltip title="View Timeline Memories">
                            <Button
                              component={Link}
                              to={`/timelines/${timeline._id}`}
                              variant="outlined"
                              color="primary"
                              size="small"
                              aria-label={`View memories of ${timeline.name || 'Untitled'} timeline`}
                            >
                              View Memories
                            </Button>
                          </Tooltip>
                          <Tooltip title="Copy Shareable Link" leaveDelay={1000} disableHoverListener>
                            <Button
                              variant="outlined"
                              color="info"
                              size="small"
                              onClick={() => {
                                const shareUrl = `${window.location.origin}/timeline/public/${timeline._id}`;
                                navigator.clipboard.writeText(shareUrl);
                                toast.success('Shareable link copied to clipboard!');
                              }}
                              aria-label={`Copy shareable link for ${timeline.name || 'Untitled'} timeline`}
                            >
                              Share
                            </Button>
                          </Tooltip>
                        </Box>
                        <Tooltip title="Delete Timeline">
                          <IconButton
                            onClick={() => handleOpenDeleteDialog(timeline)}
                            color="error"
                            size="small"
                            aria-label={`Delete ${timeline.name || 'Untitled'} timeline`}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Fade>

        {/* Pagination */}
        {filteredTimelines.length > timelinesPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              aria-label="Timeline pagination"
            />
          </Box>
        )}

        {/* No Timelines Message */}
        {filteredTimelines.length === 0 && (
          <Typography variant="h6" sx={{ textAlign: 'center', mt: 5 }}>
            No timelines found. Create one to get started!
          </Typography>
        )}
      </Box>

      {/* Create Timeline Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Timeline</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Timeline Name"
            fullWidth
            value={newTimelineName}
            onChange={(e) => setNewTimelineName(e.target.value)}
            variant="outlined"
            inputProps={{ 'aria-label': 'Timeline name' }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={newTimelineDescription}
            onChange={(e) => setNewTimelineDescription(e.target.value)}
            variant="outlined"
            multiline
            rows={2}
            inputProps={{ 'aria-label': 'Timeline description' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)} color="inherit" aria-label="Cancel timeline creation">
            Cancel
          </Button>
          <Button
            onClick={handleCreateTimeline}
            variant="contained"
            color="primary"
            aria-label="Create timeline"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the timeline "{timelineToDelete?.name || 'Untitled'}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit" aria-label="Cancel deletion">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTimeline}
            variant="contained"
            color="error"
            aria-label="Confirm deletion"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Timeline;