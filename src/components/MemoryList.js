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
} from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';

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

const MemoryList = ({ refresh }) => {
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const memoriesPerPage = 6; // Adjustable
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
      }
    };
    getTimelines();
  }, [token]);

  // Filter memories based on search query
  useEffect(() => {
    const filtered = memories.filter((memory) =>
      (memory.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (memory.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
    setFilteredMemories(filtered);
    setPage(1); // Reset to first page on search
  }, [searchQuery, memories]);

  // Check if a file is a video
  const isVideo = (filename) => {
    if (!filename) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  // Handle adding a memory to a timeline
  const handleAddToTimeline = async (memoryId) => {
    const timelineId = selectedTimeline[memoryId];
    if (!timelineId) {
      alert('Please select a timeline');
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
      alert('Memory added to timeline successfully!');
    } catch (error) {
      console.error('Error adding memory to timeline:', error);
      alert('Failed to add memory to timeline');
    }
  };

  // Handle timeline selection change
  const handleTimelineChange = (memoryId, event) => {
    setSelectedTimeline((prev) => ({
      ...prev,
      [memoryId]: event.target.value,
    }));
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredMemories.length / memoriesPerPage);
  const paginatedMemories = filteredMemories.slice(
    (page - 1) * memoriesPerPage,
    page * memoriesPerPage
  );

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
                      <Box sx={{ position: 'relative', paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
                        <video
                          controls
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain', // Show full video
                            backgroundColor: '#000', // Black background for letterboxing
                          }}
                        >
                          <source src={`http://localhost:5000/${memory.media}`} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </Box>
                    ) : (
                      <Box sx={{ position: 'relative', paddingTop: '56.25%' /* 16:9 aspect ratio as fallback */ }}>
                        <img
                          src={memory.media}
                          alt={memory.title}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain', // Show full image
                            backgroundColor: '#000', // Black background for letterboxing
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
                      <Typography variant="caption" sx={{ mt: 1, fontStyle: 'italic', display: 'block' }}>
                        <strong>AI Caption:</strong> {memory.caption || 'No caption available.'}
                      </Typography>
                    )}
                    {isVideo(memory.media) && (
                      <Typography variant="caption" sx={{ mt: 1, fontStyle: 'italic', display: 'block' }}>
                        <strong>AI Summary:</strong> {memory.summary || 'No summary available.'}
                      </Typography>
                    )}
                    {/* Timeline Selection */}
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel id={`timeline-select-label-${memory._id}`}>Add to Timeline</InputLabel>
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
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddToTimeline(memory._id)}
                      sx={{ mt: 2, borderRadius: 20, px: 3 }}
                    >
                      Add to Timeline
                    </Button>
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
    </Box>
  );
};

export default MemoryList;