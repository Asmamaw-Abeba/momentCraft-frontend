import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/system';
import Carousel from 'react-material-ui-carousel';
import Confetti from 'react-confetti';
import { Share as ShareIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Header from './Header'; // Self-contained Header

const StyledCarouselItem = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4],
  },
  borderRadius: 8,
  overflow: 'hidden',
  backgroundColor: '#fff',
}));

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
  borderRadius: 8,
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'auto',
};

const PublicTimelineViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clicks, setClicks] = useState({});
  const [unlocked, setUnlocked] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const clicksToUnlock = 5;

  useEffect(() => {
    const fetchPublicTimeline = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/timelines/public/${id}`);
        console.log('Fetched timeline data:', JSON.stringify(data, null, 2));
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
        setTimeout(() => setShowConfetti(false), 3000);
        setSelectedMemory(timeline.memories.find((m) => m._id === memoryId));
      }
      return { ...prev, [memoryId]: newClicks };
    });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/timeline/public/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Timeline link copied to clipboard!');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mt: { xs: 6, sm: 8 } }}>
          <CircularProgress aria-label="Loading timeline" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box sx={{ flexGrow: 1, textAlign: 'center', mt: { xs: 6, sm: 8 } }}>
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
      </Box>
    );
  }

  if (!timeline) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box sx={{ flexGrow: 1, textAlign: 'center', mt: { xs: 6, sm: 8 } }}>
          <Typography variant="h6">Timeline not found.</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <Header />
      <Box sx={{ flexGrow: 1, padding: { xs: 2, sm: 3, md: 4 }, mt: { xs: 6, sm: 8 } }}>
        {/* Header Section */}
        <Fade in>
          <Box sx={{ textAlign: 'center', mb: 4, position: 'relative' }}>
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
              sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}
            >
              Created by: {timeline.user?.username || 'Unknown'}
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ mt: 1, display: 'block' }}
            >
              Click memories {clicksToUnlock} times to unlock hidden surprises!
            </Typography>
            <Tooltip title="Share this timeline">
              <IconButton
                onClick={handleShare}
                sx={{ position: 'absolute', top: 0, right: 0, color: '#1976d2' }}
                aria-label="Share timeline link"
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Fade>

        {/* Carousel Section */}
        {timeline.memories && timeline.memories.length > 0 ? (
          <Carousel
            sx={{ mt: 3 }}
            navButtonsAlwaysVisible={!isMobile}
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
                  py: 2,
                }}
              >
                {memory.media ? (
                  <>
                    <CardMedia
                      component={memory.media.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'img'}
                      src={memory.media}
                      controls={memory.media.match(/\.(mp4|webm|ogg)$/) && !isMobile}
                      sx={{
                        width: '100%',
                        maxHeight: { xs: '40vh', sm: '50vh', md: '60vh' },
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
                        sx={{ mt: 1, maxWidth: '50%', mx: 'auto', height: 6, borderRadius: 3 }}
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
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                    Easter Egg Unlocked!
                  </Typography>
                  {selectedMemory.hiddenContent?.media && (
                    <CardMedia
                      component={selectedMemory.hiddenContent.media.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'img'}
                      src={selectedMemory.hiddenContent.media}
                      controls={selectedMemory.hiddenContent.media.match(/\.(mp4|webm|ogg)$/) && !isMobile}
                      sx={{
                        width: '100%',
                        maxHeight: { xs: '40vh', sm: '50vh' },
                        objectFit: 'contain',
                        borderRadius: 2,
                        boxShadow: 2,
                      }}
                      aria-label={`Hidden content for ${selectedMemory.title || 'Untitled'}`}
                    />
                  )}
                  <Typography variant="body1" sx={{ mt: 2, color: '#388e3c' }}>
                    {selectedMemory.hiddenContent?.text || 'Congratulations on finding this secret!'}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setSelectedMemory(null)}
                    sx={{ mt: 3, width: '100%' }}
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
    </Box>
  );
};

export default PublicTimelineViewer;