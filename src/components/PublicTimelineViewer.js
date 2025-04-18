import React, { useState, useEffect, useRef } from 'react';
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
  Collapse,
} from '@mui/material';
import { styled, keyframes } from '@mui/system';
import Confetti from 'react-confetti';
import {
  Share as ShareIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  PanTool as PanToolIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import Header from './Header';

// Scroll animation for hand icon
const scrollAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(20px); }
  100% { transform: translateY(0); }
`;

// Styled Components
const StyledMemoryItem = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4],
  },
  borderRadius: 8,
  overflow: 'hidden',
  backgroundColor: '#fff',
  margin: '0 auto',
  padding: theme.spacing(2),
  scrollSnapAlign: 'start',
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const ScrollContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  overflowY: 'auto',
  scrollSnapType: 'y mandatory',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  position: 'relative',
  backgroundColor: '#f5f5f5',
}));

const ProgressDots = styled(Box)(({ theme }) => ({
  position: 'fixed',
  right: theme.spacing(1),
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  zIndex: 20,
}));

const ProgressDot = styled(Box)(({ theme, isActive }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: isActive ? '#1976d2' : 'rgba(255, 255, 255, 0.5)',
  transition: 'background-color 0.3s',
  boxShadow: isActive ? '0 0 8px rgba(0, 0, 0, 0.3)' : 'none',
}));

const ScrollPrompt = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 30,
  backgroundColor: 'rgba(25, 118, 210, 0.9)',
  borderRadius: '50%',
  padding: theme.spacing(1),
  boxShadow: theme.shadows[4],
  animation: `${scrollAnimation} 1.5s ease-in-out infinite`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: { xs: 2, sm: 3 },
  borderRadius: 8,
  width: { xs: '95vw', sm: '80vw' },
  maxWidth: '1000px',
  maxHeight: { xs: '95vh', sm: '90vh' },
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
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [showScrollPrompt, setShowScrollPrompt] = useState(false);
  const scrollContainerRef = useRef(null);
  const idleTimeoutRef = useRef(null);
  const clicksToUnlock = 5;

  // Handle scroll prompt logic
  useEffect(() => {
    const hasShownPrompt = sessionStorage.getItem('scrollPromptShown');
    if (hasShownPrompt || timeline?.memories?.length <= 1) {
      return;
    }

    if (currentMemoryIndex === 0) {
      idleTimeoutRef.current = setTimeout(() => {
        setShowScrollPrompt(true);
        setTimeout(() => {
          setShowScrollPrompt(false);
          sessionStorage.setItem('scrollPromptShown', 'true');
        }, 3000);
      }, 5000);
    }

    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [currentMemoryIndex, timeline]);

  useEffect(() => {
    if (currentMemoryIndex !== 0 && showScrollPrompt) {
      setShowScrollPrompt(false);
      sessionStorage.setItem('scrollPromptShown', 'true');
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    }
  }, [currentMemoryIndex, showScrollPrompt]);

  useEffect(() => {
    const fetchPublicTimeline = async () => {
      try {
        const { data } = await axios.get(`https://momentcraft-backend.onrender.com/api/timelines/public/${id}`);
        const enhancedData = {
          ...data,
          memories: data.memories.map((memory) => ({
            ...memory,
            hiddenContent: memory.hiddenContent || {
              text: `Secret unlocked for ${memory.title || 'this memory'}!`,
              media: '/fallback-image.jpg', // Use local fallback for hidden content
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

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop;
        const windowHeight = window.innerHeight;
        const index = Math.round(scrollTop / windowHeight);
        if (index !== currentMemoryIndex) {
          setCurrentMemoryIndex(index);
          // Optional: Trigger notification on scroll (uncomment if needed)
          /*
          if (window.subscribeToNotifications) {
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/push/notify/${localStorage.getItem('userId')}`, {
              title: 'New Memory!',
              body: `Check out memory ${index + 1} in the timeline!`,
            });
          }
          */
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [timeline, currentMemoryIndex]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const fetchPublicTimeline = async () => {
      try {
        const { data } = await axios.get(`https://momentcraft-backend.onrender.com/api/timelines/public/${id}`);
        const enhancedData = {
          ...data,
          memories: data.memories.map((memory) => ({
            ...memory,
            hiddenContent: memory.hiddenContent || {
              text: `Secret unlocked for ${memory.title || 'this memory'}!`,
              media: '/fallback-image.jpg',
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

  const handleDotClick = (index) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: index * window.innerHeight,
        behavior: 'smooth',
      });
    }
  };

  const toggleDescription = () => {
    setDescriptionOpen((prev) => !prev);
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
      {showConfetti && (
        <Fade in={showConfetti}>
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        </Fade>
      )}
      <Header />
      <Box sx={{ flexGrow: 1, mt: { xs: 6, sm: 8 } }}>
        <Fade in>
          <Box
            sx={{
              textAlign: 'center',
              px: { xs: 1, sm: 2 },
              mb: 1,
              position: 'relative',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' },
                  color: '#1976d2',
                }}
              >
                {timeline.name || 'Untitled Timeline'}
              </Typography>
              <IconButton
                onClick={toggleDescription}
                sx={{ color: '#1976d2' }}
                aria-label={descriptionOpen ? 'Hide timeline details' : 'Show timeline details'}
              >
                {descriptionOpen ? (
                  <KeyboardArrowUpIcon fontSize={isMobile ? 'small' : 'medium'} />
                ) : (
                  <KeyboardArrowDownIcon fontSize={isMobile ? 'small' : 'medium'} />
                )}
              </IconButton>
            </Box>
            <Collapse in={descriptionOpen}>
              <Box sx={{ mt: 1 }}>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                >
                  {timeline.description || 'No description available'}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ mt: 0.5, display: 'block', fontStyle: 'italic' }}
                >
                  Created by: {timeline.user?.username || 'Unknown'}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  Tap memories {clicksToUnlock} times to unlock hidden surprises!
                </Typography>
              </Box>
            </Collapse>
            <Tooltip title="Share this timeline">
              <IconButton
                onClick={handleShare}
                sx={{
                  position: 'absolute',
                  top: { xs: -4, sm: 0 },
                  right: { xs: 4, sm: 8 },
                  color: '#1976d2',
                }}
                aria-label="Share timeline link"
              >
                <ShareIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </Tooltip>
          </Box>
        </Fade>

        {timeline.memories && timeline.memories.length > 0 ? (
          <ScrollContainer ref={scrollContainerRef} role="region" aria-label="Memory scroll">
            {timeline.memories.map((memory, index) => (
              <StyledMemoryItem key={memory._id}>
                {memory.media ? (
                  <>
                    <CardMedia
                      component={memory.media.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'img'}
                      src={memory.media}
                      controls={memory.media.match(/\.(mp4|webm|ogg)$/) && !isMobile}
                      sx={{
                        width: '100%',
                        maxHeight: { xs: '90vh', sm: '80vh', md: '70vh' },
                        objectFit: 'contain',
                        borderRadius: 2,
                        boxShadow: 3,
                        margin: '0 auto',
                      }}
                      onClick={() => handleMediaClick(memory._id)}
                      onError={(e) => {
                        console.error(`Failed to load media: ${memory.media}`, e);
                        e.target.src = '/fallback-image.jpg';
                      }}
                      onLoad={() => console.log(`Successfully loaded media: ${memory.media}`)}
                      loading="lazy"
                      aria-label={`Memory: ${memory.title || 'Untitled'} - Tap to explore`}
                    />
                    {!unlocked[memory._id] && (
                      <LinearProgress
                        variant="determinate"
                        value={((clicks[memory._id] || 0) / clicksToUnlock) * 100}
                        sx={{
                          mt: 1,
                          maxWidth: '50%',
                          mx: 'auto',
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#1976d2',
                            transition: 'width 0.3s ease-in-out',
                          },
                        }}
                        aria-label={`Progress to unlock hidden content: ${clicks[memory._id] || 0}/${clicksToUnlock}`}
                      />
                    )}
                  </>
                ) : (
                  <Typography
                    variant="body1"
                    sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}
                  >
                    No media available for this memory
                  </Typography>
                )}
                <Typography
                  variant="h6"
                  sx={{
                    mt: 2,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    fontWeight: 'medium',
                    textAlign: 'center',
                  }}
                >
                  {memory.title || 'Untitled Memory'}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    mt: 1,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    textAlign: 'center',
                  }}
                >
                  {memory.description || 'No description'}
                </Typography>
                {unlocked[memory._id] && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: '#388e3c',
                      fontStyle: 'italic',
                      textAlign: 'center',
                    }}
                  >
                    Unlocked! Tap again to view the secret.
                  </Typography>
                )}
              </StyledMemoryItem>
            ))}
            <ProgressDots>
              {timeline.memories.map((_, index) => (
                <ProgressDot
                  key={index}
                  isActive={index === currentMemoryIndex}
                  onClick={() => handleDotClick(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to memory ${index + 1}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleDotClick(index);
                    }
                  }}
                />
              ))}
            </ProgressDots>
            {showScrollPrompt && (
              <Fade in={showScrollPrompt}>
                <ScrollPrompt>
                  <Tooltip title="Scroll down for more memories">
                    <PanToolIcon
                      sx={{
                        color: '#fff',
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                      }}
                      aria-label="Scroll down prompt"
                    />
                  </Tooltip>
                </ScrollPrompt>
              </Fade>
            )}
          </ScrollContainer>
        ) : (
          <Typography
            variant="h6"
            sx={{ textAlign: 'center', mt: 5, color: 'text.secondary' }}
          >
            No memories found in this timeline.
          </Typography>
        )}

        <Modal
          open={!!selectedMemory}
          onClose={() => setSelectedMemory(null)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500, sx: { backgroundColor: 'rgba(0, 0, 0, 0.7)' } }}
        >
          <Fade in={!!selectedMemory}>
            <Box sx={modalStyle}>
              {selectedMemory && unlocked[selectedMemory._id] && (
                <>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#1976d2',
                      fontWeight: 'bold',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    }}
                  >
                    Easter Egg Unlocked!
                  </Typography>
                  {selectedMemory.hiddenContent?.media && (
                    <CardMedia
                      component={selectedMemory.hiddenContent.media.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'img'}
                      src={selectedMemory.hiddenContent.media}
                      controls={selectedMemory.hiddenContent.media.match(/\.(mp4|webm|ogg)$/) && !isMobile}
                      sx={{
                        width: '100%',
                        maxHeight: { xs: '90vh', sm: '80vh' },
                        objectFit: 'contain',
                        borderRadius: 2,
                        boxShadow: 2,
                        margin: '0 auto',
                      }}
                      onError={(e) => {
                        console.error(`Failed to load hidden media: ${selectedMemory.hiddenContent.media}`, e);
                        e.target.src = '/fallback-image.jpg';
                      }}
                      onLoad={() => console.log(`Successfully loaded hidden media: ${selectedMemory.hiddenContent.media}`)}
                      aria-label={`Hidden content for ${selectedMemory.title || 'Untitled'}`}
                    />
                  )}
                  <Typography
                    variant="body1"
                    sx={{
                      mt: 2,
                      color: '#388e3c',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    }}
                  >
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