import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  CardMedia,
  Button,
  CircularProgress,
  Fade,
} from '@mui/material';
import Carousel from 'react-material-ui-carousel';

const PublicTimelineViewer = () => {
  const { id } = useParams();
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicTimeline = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/timelines/public/${id}`);
        console.log('Fetched timeline data:', JSON.stringify(data, null, 2));
        setTimeline(data);
      } catch (error) {
        console.error('Error fetching public timeline:', error);
        setError('Failed to load timeline. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTimeline();
  }, [id]);

  // Retry fetching on error
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const fetchPublicTimeline = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/timelines/public/${id}`);
        setTimeline(data);
      } catch (error) {
        setError('Failed to load timeline. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTimeline();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" color="primary" onClick={handleRetry} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!timeline) {
    return <Typography variant="h6" sx={{ textAlign: 'center', mt: 5 }}>Timeline not found.</Typography>;
  }

  return (
    <Box
      sx={{
        padding: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        minHeight: '100vh',
        bgcolor: '#f5f5f5', // Light background for contrast
      }}
    >
      {/* Header */}
      <Fade in>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, // Responsive font size
              color: '#1976d2',
            }}
          >
            {timeline.name || 'Untitled Timeline'}
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            {timeline.description || 'No description available'}
          </Typography>
        </Box>
      </Fade>

      {/* Carousel Section */}
      {timeline.memories && timeline.memories.length > 0 ? (
        <Carousel
          sx={{ mt: 3 }}
          navButtonsAlwaysVisible // Show navigation buttons
          indicators // Show progress dots
          animation="slide"
          duration={500} // Smooth transition
        >
          {timeline.memories.map((memory) => (
            <Box
              key={memory._id}
              sx={{
                textAlign: 'center',
                px: { xs: 1, sm: 2 }, // Responsive padding
                maxWidth: '100%',
              }}
            >
              {memory.media ? (
                <CardMedia
                  component={memory.media.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'img'}
                  src={memory.media}
                  controls={memory.media.match(/\.(mp4|webm|ogg)$/)}
                  sx={{
                    width: '100%',
                    maxHeight: { xs: '50vh', sm: '60vh', md: '70vh' }, // Dynamic height
                    objectFit: 'contain', // Preserve aspect ratio without cuts
                    borderRadius: 2,
                    boxShadow: 3,
                  }}
                  onError={(e) => {
                    console.error(`Failed to load media: ${memory.media}`);
                    e.target.src = 'https://via.placeholder.com/400x300?text=Media+Not+Found'; // Fallback image
                  }}
                  loading="lazy" // Lazy load media
                />
              ) : (
                <Typography variant="body1" sx={{ py: 5 }}>
                  No media available for this memory
                </Typography>
              )}
              <Typography
                variant="h6"
                sx={{
                  mt: 2,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  fontWeight: 'medium',
                }}
              >
                {memory.title || 'Untitled Memory'}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 1, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
              >
                {memory.description || 'No description'}
              </Typography>
            </Box>
          ))}
        </Carousel>
      ) : (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 5 }}>
          No memories found in this timeline.
        </Typography>
      )}
    </Box>
  );
};

export default PublicTimelineViewer;