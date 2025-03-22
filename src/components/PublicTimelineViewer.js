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
  LinearProgress,
  Modal,
  Backdrop,
} from '@mui/material';
import { styled } from '@mui/system';
import Carousel from 'react-material-ui-carousel';
import Confetti from 'react-confetti';

const StyledCarouselItem = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 8,
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'auto',
};

const PublicTimelineViewer = () => {
  const { id } = useParams();
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clicks, setClicks] = useState({}); // Tracks clicks per memory
  const [unlocked, setUnlocked] = useState({}); // Tracks unlocked memories
  const [showConfetti, setShowConfetti] = useState(false); // Confetti state
  const [selectedMemory, setSelectedMemory] = useState(null); // For modal
  const clicksToUnlock = 5; // Number of clicks to unlock hidden content

  useEffect(() => {
    const fetchPublicTimeline = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/timelines/public/${id}`);
        console.log('Fetched timeline data:', JSON.stringify(data, null, 2));
        // Simulate hidden content if not provided by backend
        const enhancedData = {
          ...data,
          memories: data.memories.map((memory) => ({
            ...memory,
            hiddenContent: memory.hiddenContent || {
              text: `Secret unlocked for ${memory.title || 'this memory'}!`,
              media: 'https://via.placeholder.com/300?text=Easter+Egg',
            },
          })),
        };
        setTimeline(enhancedData);
      } catch (error) {
        console.error('Error fetching public timeline:', error);
        setError('Failed to load timeline. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTimeline();
  }, [id]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const fetchPublicTimeline = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/timelines/public/${id}`);
        const enhancedData = {
          ...data,
          memories: data.memories.map((memory) => ({
            ...memory,
            hiddenContent: memory.hiddenContent || {
              text: `Secret unlocked for ${memory.title || 'this memory'}!`,
              media: 'https://via.placeholder.com/300?text=Easter+Egg',
            },
          })),
        };
        setTimeline(enhancedData);
      } catch (error) {
        setError('Failed to load timeline. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTimeline();
  };

  const handleMediaClick = (memoryId) => {
    if (unlocked[memoryId]) {
      setSelectedMemory(timeline.memories.find((m) => m._id === memoryId));
      return;
    }

    setClicks((prev) => {
      const newClicks = (prev[memoryId] || 0) + 1;
      if (newClicks >= clicksToUnlock) {
        setUnlocked((prevUnlocked) => ({ ...prevUnlocked, [memoryId]: true }));
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000); // Confetti for 3 seconds
        setSelectedMemory(timeline.memories.find((m) => m._id === memoryId));
      }
      return { ...prev, [memoryId]: newClicks };
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress aria-label="Loading timeline" />
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
          aria-label="Retry loading timeline"
        >
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
        padding: { xs: 2, sm: 3, md: 4 },
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      
      {/* Header */}
      <Fade in>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
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
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ mt: 1, display: 'block' }}
          >
            Click on memories to uncover hidden surprises! ({clicksToUnlock} clicks to unlock)
          </Typography>
        </Box>
      </Fade>

      {/* Carousel Section */}
      {timeline.memories && timeline.memories.length > 0 ? (
        <Carousel
          sx={{ mt: 3 }}
          navButtonsAlwaysVisible
          indicators
          animation="slide"
          duration={500}
        >
          {timeline.memories.map((memory) => (
            <StyledCarouselItem
              key={memory._id}
              sx={{
                textAlign: 'center',
                px: { xs: 1, sm: 2 },
                maxWidth: '100%',
              }}
            >
              {memory.media ? (
                <>
                  <CardMedia
                    component={memory.media.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'img'}
                    src={memory.media}
                    controls={memory.media.match(/\.(mp4|webm|ogg)$/)}
                    sx={{
                      width: '100%',
                      maxHeight: { xs: '50vh', sm: '60vh', md: '70vh' },
                      objectFit: 'contain',
                      borderRadius: 2,
                      boxShadow: 3,
                    }}
                    onClick={() => handleMediaClick(memory._id)}
                    onError={(e) => {
                      console.error(`Failed to load media: ${memory.media}`);
                      e.target.src = 'https://via.placeholder.com/400x300?text=Media+Not+Found';
                    }}
                    loading="lazy"
                    aria-label={`Memory: ${memory.title || 'Untitled'} - Click to explore`}
                  />
                  {!unlocked[memory._id] && (
                    <LinearProgress
                      variant="determinate"
                      value={((clicks[memory._id] || 0) / clicksToUnlock) * 100}
                      sx={{ mt: 1, maxWidth: '50%', mx: 'auto' }}
                      aria-label={`Progress to unlock hidden content: ${clicks[memory._id] || 0}/${clicksToUnlock}`}
                    />
                  )}
                </>
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
              {unlocked[memory._id] && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: '#388e3c', fontStyle: 'italic' }}
                >
                  Unlocked! Click again to view the secret.
                </Typography>
              )}
            </StyledCarouselItem>
          ))}
        </Carousel>
      ) : (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 5 }}>
          No memories found in this timeline.
        </Typography>
      )}

      {/* Hidden Content Modal */}
      <Modal
        open={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={!!selectedMemory}>
          <Box sx={modalStyle}>
            {selectedMemory && unlocked[selectedMemory._id] && (
              <>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Easter Egg Unlocked!
                </Typography>
                {selectedMemory.hiddenContent?.media && (
                  <CardMedia
                    component={selectedMemory.hiddenContent.media.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'img'}
                    src={selectedMemory.hiddenContent.media}
                    controls={selectedMemory.hiddenContent.media.match(/\.(mp4|webm|ogg)$/)}
                    sx={{
                      width: '100%',
                      maxHeight: '50vh',
                      objectFit: 'contain',
                      borderRadius: 2,
                    }}
                    aria-label={`Hidden content for ${selectedMemory.title || 'Untitled'}`}
                  />
                )}
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {selectedMemory.hiddenContent?.text || 'Congratulations on finding this secret!'}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setSelectedMemory(null)}
                  sx={{ mt: 3 }}
                  aria-label="Close hidden content"
                >
                  Close
                </Button>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default PublicTimelineViewer;