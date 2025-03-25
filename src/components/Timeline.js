import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Skeleton,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Link as LinkIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { styled } from '@mui/system';
import Carousel from 'react-material-ui-carousel';
import AuthContext from '../context/AuthContext';
import Header from './Header';

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': { transform: 'scale(1.03)', boxShadow: theme.shadows[6] },
  borderRadius: 12,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const Timeline = () => {
  const [timelines, setTimelines] = useState([]);
  const [filteredTimelines, setFilteredTimelines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTimelineName, setNewTimelineName] = useState('');
  const [newTimelineDescription, setNewTimelineDescription] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [timelineToDelete, setTimelineToDelete] = useState(null);
  const [timelineToShare, setTimelineToShare] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [maxThumbnails, setMaxThumbnails] = useState(3);
  const [soundOn, setSoundOn] = useState(false);
  const timelinesPerPage = 6;
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Navigation handlers for Header
  const handleSoundToggle = () => setSoundOn((prev) => !prev);
  const handleExploreMemories = () => navigate('/memories');
  const handleManageFriends = () => navigate('/friends');
  const handleJoinNow = () => navigate('/register');

  // Memoize fetch functions
  const fetchTimelines = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/timelines', {
        headers: { Authorization: `Bearer ${token}` },
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
  }, [token]);

  const fetchFriends = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTimelines();
      fetchFriends();
    } else {
      setLoading(false);
    }
  }, [fetchTimelines, fetchFriends, token]);

  // Memoize search and sort handler
  const handleSearchAndSort = useCallback(() => {
    let result = [...timelines];
    if (searchQuery) {
      result = result.filter(
        (timeline) =>
          timeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          timeline.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [searchQuery, sortBy, timelines]);

  useEffect(() => {
    handleSearchAndSort();
  }, [handleSearchAndSort]);

  const handleCreateTimeline = async () => {
    if (!newTimelineName.trim()) {
      toast.error('Timeline name is required');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:5000/api/timelines',
        { name: newTimelineName, description: newTimelineDescription },
        { headers: { Authorization: `Bearer ${token}` } }
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
        headers: { Authorization: `Bearer ${token}` },
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

  const handleShareWithFriends = async () => {
    if (!timelineToShare || selectedFriends.length === 0) {
      toast.error('Please select at least one friend to share with');
      return;
    }
    try {
      await axios.post(
        'http://localhost:5000/api/auth/share-timeline',
        { timelineId: timelineToShare._id, friendIds: selectedFriends },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenShareDialog(false);
      setSelectedFriends([]);
      setTimelineToShare(null);
      toast.success('Timeline shared with friends successfully!');
    } catch (error) {
      console.error('Error sharing timeline:', error);
      toast.error(error.response?.data?.message || 'Failed to share timeline');
    }
  };

  const handleCopyLink = (timelineId) => {
    const shareUrl = `${window.location.origin}/timeline/public/${timelineId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Timeline link copied to clipboard!');
  };

  const handleOpenDeleteDialog = (timeline) => {
    setTimelineToDelete(timeline);
    setOpenDeleteDialog(true);
  };

  const handleOpenShareDialog = (timeline) => {
    setTimelineToShare(timeline);
    setSelectedFriends([]);
    setOpenShareDialog(true);
  };

  const handleFriendToggle = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const paginatedTimelines = filteredTimelines.slice(
    (page - 1) * timelinesPerPage,
    page * timelinesPerPage
  );
  const totalPages = Math.ceil(filteredTimelines.length / timelinesPerPage);

  if (!token) {
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
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6">Please log in to view timelines.</Typography>
        </Box>
      </Box>
    );
  }

  if (loading) {
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
        <Box sx={{ padding: { xs: 2, sm: 3 }, mt: { xs: 6, sm: 8 } }}>
          <Grid container spacing={isMobile ? 2 : 3}>
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
      </Box>
    );
  }

  if (error) {
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
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button variant="contained" color="primary" onClick={fetchTimelines} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

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
      <Box sx={{ padding: { xs: 2, sm: 3 }, mt: { xs: 6, sm: 8 } }}>
        {/* Search, Sort, and Create Controls */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 3, gap: 2 }}>
          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold' }}>
            Timelines
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
            <TextField
              label="Search Timelines"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: { xs: '100%', sm: 200 }, borderRadius: 1 }}
              size="small"
              aria-label="Search timelines"
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              variant="outlined"
              sx={{ width: { xs: '100%', sm: 120 }, borderRadius: 1 }}
              size="small"
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="memories">Memories</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </Select>
            <Select
              value={maxThumbnails}
              onChange={(e) => setMaxThumbnails(e.target.value)}
              variant="outlined"
              sx={{ width: { xs: '100%', sm: 80 }, borderRadius: 1 }}
              size="small"
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={5}>5</MenuItem>
            </Select>
            <Tooltip title="Create New Timeline">
              <IconButton color="primary" onClick={() => setOpenCreateDialog(true)}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Fade in={filteredTimelines.length > 0}>
          <Grid container spacing={isMobile ? 2 : 3}>
            {paginatedTimelines.map((timeline, index) => (
              <Grid item xs={12} sm={6} md={4} key={timeline._id}>
                <Fade in timeout={300 + index * 100}>
                  <StyledCard>
                    {timeline.memories.length > 0 ? (
                      <Carousel
                        autoPlay={false}
                        navButtonsAlwaysVisible={!isMobile}
                        indicators
                        sx={{ height: { xs: 120, sm: 150, md: 180 } }}
                      >
                        {timeline.memories.slice(0, maxThumbnails).map((memory) => (
                          <CardMedia
                            key={memory._id}
                            component={memory.media.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'img'}
                            src={memory.media}
                            controls={memory.media.match(/\.(mp4|webm|ogg)$/) && !isMobile}
                            sx={{ height: '100%', objectFit: 'cover' }}
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
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar
                          sx={{ width: 24, height: 24, bgcolor: '#1976d2' }}
                          alt={timeline.user?.username || 'Unknown'}
                          src={timeline.user?.avatar}
                        >
                          {timeline.user?.username?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                        <Typography
                          variant="body2"
                          component={Link}
                          to={`/profile/${timeline.user?._id}`}
                          sx={{ color: '#1976d2', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          {timeline.user?.username || 'Unknown User'}
                        </Typography>
                      </Box>
                      <Typography variant={isMobile ? 'body1' : 'h6'} sx={{ fontWeight: 'bold' }}>
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
                          <Button
                            component={Link}
                            to={`/timelines/${timeline._id}`}
                            variant="outlined"
                            color="primary"
                            size="small"
                          >
                            View
                          </Button>
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            onClick={() => handleOpenShareDialog(timeline)}
                          >
                            Share
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={() => handleCopyLink(timeline._id)}
                          >
                            Copy Link
                          </Button>
                        </Box>
                        <Tooltip title="Delete Timeline">
                          <IconButton
                            onClick={() => handleOpenDeleteDialog(timeline)}
                            color="error"
                            size="small"
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

        {filteredTimelines.length > timelinesPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>
        )}

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
            size={isMobile ? 'small' : 'medium'}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={newTimelineDescription}
            onChange={(e) => setNewTimelineDescription(e.target.value)}
            variant="outlined"
            multiline
            rows={isMobile ? 2 : 3}
            size={isMobile ? 'small' : 'medium'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleCreateTimeline} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{timelineToDelete?.name || 'Untitled'}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteTimeline} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share with Friends Dialog */}
      <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share "{timelineToShare?.name || 'Untitled'}" with Friends</DialogTitle>
        <DialogContent>
          {friends.length === 0 ? (
            <Typography>No friends to share with. Add some friends first!</Typography>
          ) : (
            <List dense>
              {friends.map((friend) => (
                <ListItem key={friend._id} sx={{ py: 0 }}>
                  <Checkbox
                    checked={selectedFriends.includes(friend._id)}
                    onChange={() => handleFriendToggle(friend._id)}
                  />
                  <ListItemText primary={friend.username} secondary={friend.email || 'No email'} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShareDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleShareWithFriends}
            variant="contained"
            color="primary"
            disabled={friends.length === 0 || selectedFriends.length === 0}
          >
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Timeline;