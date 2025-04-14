import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Fade,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';
import Carousel from 'react-material-ui-carousel';
import AuthContext from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GroupIcon from '@mui/icons-material/Group';
import UploadIcon from '@mui/icons-material/Upload';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';

// Styled Components
const FullScreenBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, rgba(107, 72, 255, 0.9), rgba(0, 221, 235, 0.9))',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const MediaContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1,
  transition: 'transform 5s ease-in-out',
  '&:hover': { transform: 'scale(1.05)' },
});

const Overlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0, 0, 0, 0.3)',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1, 3),
  fontSize: '1.2rem',
  borderRadius: 50,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: '#6b48ff',
  '&:hover': {
    backgroundColor: 'white',
    transform: 'scale(1.1)',
    transition: 'transform 0.3s ease',
  },
}));

const Home = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(false);

  const teaserMemory = {
    _id: 'teaser',
    media: 'https://cdn.pixabay.com/video/2023/03/22/156112-810306584_large.mp4',
    title: 'Preview Your Moment',
  };

  useEffect(() => {
    const fetchPublicMemories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://momentcraft-backend.onrender.com/api/memories/public');
        const fetchedMemories = response.data.slice(0, 6);
        setMemories(fetchedMemories.length > 0 ? fetchedMemories : [teaserMemory]);
      } catch (error) {
        console.error('Error fetching public memories:', error);
        toast.error('Failed to load memories');
        setMemories([teaserMemory]);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicMemories();
  }, []);

  const handleSoundToggle = () => setSoundOn((prev) => !prev);
  const handleExploreMemories = () => navigate('/best-memories');
  const handleManageFriends = () => navigate('/friends');
  const handleJoinNow = () => navigate('/register');
  const handleUploadMemory = () => navigate('/add-memory');
  return (
    <Box sx={{ overflow: 'hidden', bgcolor: '#f5f5f5' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Header
        token={token}
        onExplore={handleExploreMemories}
        onFriends={handleManageFriends}
        soundOn={soundOn}
        onSoundToggle={handleSoundToggle}
        onJoin={handleJoinNow}
      />

      <FullScreenBox>
        {loading ? (
          <CircularProgress sx={{ zIndex: 3, color: 'white' }} />
        ) : (
          <>
            {soundOn && (
              <audio autoPlay loop>
                <source src="https://cdn.pixabay.com/audio/2023/03/22/12-56-05-740_200x200.mp3" type="audio/mp3" />
              </audio>
            )}
            <Carousel
              autoPlay
              interval={5000}
              animation="fade"
              navButtonsAlwaysVisible={false}
              indicators={true}
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
            >
              {memories.map((memory) => (
                <MediaContainer key={memory._id}>
                  {memory.media.match(/\.(mp4|webm|ogg)$/) ? (
                    <video
                      src={memory.media}
                      autoPlay
                      loop
                      muted={!soundOn}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img
                      src={memory.media || 'https://via.placeholder.com/1920x1080?text=Your+Moment'}
                      alt={memory.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </MediaContainer>
              ))}
            </Carousel>
            <Overlay>
              <Fade in={!loading}>
                <Box sx={{ textAlign: 'center', zIndex: 3 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 4,
                      textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {memories[0]?._id === 'teaser' ? 'Preview Your Moment' : 'Your Story Lives Here'}
                  </Typography>
                  <Box>
                    <ActionButton startIcon={<PlayArrowIcon />} onClick={handleExploreMemories}>
                      Explore
                    </ActionButton>
                    <ActionButton startIcon={<GroupIcon />} onClick={handleManageFriends}>
                      Connect
                    </ActionButton>
                    {token && (
                      <ActionButton startIcon={<UploadIcon />} onClick={handleUploadMemory}>
                        Upload memory
                      </ActionButton>
                    )}
                    {!token && (
                      <ActionButton startIcon={<VideoCameraFrontIcon />} onClick={handleJoinNow}>
                        Create
                      </ActionButton>
                    )}
                  </Box>
                </Box>
              </Fade>
            </Overlay>
          </>
        )}
      </FullScreenBox>

      <Box sx={{ py: 1, textAlign: 'center', bgcolor: 'rgba(0, 0, 0, 0.1)', zIndex: 5 }}>
        <Typography variant="caption" sx={{ color: 'white' }}>
          © 2025 MomentCraft by Asmamaw
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;