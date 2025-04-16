import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Skeleton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/system';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import Header from './Header'; // Import the Header component

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

const SharedTimelines = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sharedTimelines, setSharedTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(false); // For Header sound toggle

  // Navigation handlers for Header
  const handleSoundToggle = () => setSoundOn((prev) => !prev);
  const handleExploreMemories = () => navigate('/best-memories');
  const handleManageFriends = () => navigate('/friends');
  const handleJoinNow = () => navigate('/register');

  useEffect(() => {
    const fetchSharedTimelines = async () => {
      try {
        const response = await axios.get('https://momentcraft-backend.onrender.com/api/auth/me/shared-timelines', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Assuming response.data includes sharedBy user info; adjust if backend differs
        setSharedTimelines(response.data || []);
      } catch (error) {
        console.error('Error fetching shared timelines:', error);
        toast.error('Failed to load shared timelines');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSharedTimelines();
  }, [token]);

  // Navigate to public timeline details
  const handleViewDetails = (timelineId) => {
    const publicUrl = `${window.location.origin}/timeline/public/${timelineId}`;
    window.location.href = publicUrl; // Full navigation to public URL
  };

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', padding: 3 }}>
        <Header
          token={token}
          onExplore={handleExploreMemories}
          onFriends={handleManageFriends}
          soundOn={soundOn}
          onSoundToggle={handleSoundToggle}
          onJoin={handleJoinNow}
        />
        <Typography sx={{ mt: 8 }}>Please log in to view shared timelines.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', padding: 3 }}>
        <Header
          token={token}
          onExplore={handleExploreMemories}
          onFriends={handleManageFriends}
          soundOn={soundOn}
          onSoundToggle={handleSoundToggle}
          onJoin={handleJoinNow}
        />
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom>Loading...</Typography>
          <Grid container spacing={3}>
            {[...Array(3)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 12 }} />
                <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
              </Grid>
            ))}
          </Grid>
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
      <Box sx={{ padding: 3, mt: 8 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
          Shared Timelines
        </Typography>
        {sharedTimelines.length === 0 ? (
          <Typography color="textSecondary" sx={{ mt: 2 }}>
            No timelines shared with you yet.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {sharedTimelines.map((timeline) => (
              <Grid item xs={12} sm={6} md={4} key={timeline._id}>
                <StyledCard>
                  <CardMedia
                    component="img"
                    height="140"
                    image={timeline.memories[0]?.media || 'https://via.placeholder.com/150'}
                    alt={timeline.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                      {timeline.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {timeline.description || 'No description'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Memories: {timeline.memories.length}
                    </Typography>
                    {/* Display sharedBy user (assuming backend provides it) */}
                    {timeline.sharedBy && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Shared by: {timeline.sharedBy.username || timeline.sharedBy.email}
                      </Typography>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Tooltip title="View timeline details">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleViewDetails(timeline._id)}
                          sx={{ borderRadius: 20 }}
                        >
                          View Details
                        </Button>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default SharedTimelines;