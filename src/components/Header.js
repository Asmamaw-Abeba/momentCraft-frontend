import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Switch,
  Box,
  Tooltip, // Added Tooltip import
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import UploadIcon from '@mui/icons-material/Upload';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { styled } from '@mui/system';
import AuthContext from '../context/AuthContext';

// Styled Components
const SmartAppBar = styled(AppBar)(({ theme }) => ({
  position: 'fixed',
  background: 'linear-gradient(135deg, rgba(107, 72, 255, 0.9), rgba(0, 221, 235, 0.9))',
  color: 'white',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  zIndex: 10,
}));

const SmartButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1, 3),
  fontSize: '1.2rem',
  borderRadius: 50,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: '#6b48ff',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'white',
    transform: 'scale(1.05)',
    transition: 'transform 0.3s ease',
  },
}));

const Header = ({ token, onExplore, onFriends, soundOn, onSoundToggle, onJoin }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Upload memory handler
  const handleUploadMemory = () => navigate('/add-memory');

  return (
    <SmartAppBar>
      <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left: Title */}
        <Tooltip title="Go to Home" arrow>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              textShadow: '1px 1px 4px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer', // Indicate clickable
            }}
            onClick={() => navigate('/')}
          >
            MomentCraft
          </Typography>
        </Tooltip>

        {/* Right: Navigation, Logout, and Sound Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {token ? (
            <>
              <Tooltip title="Upload a Memory" arrow>
                <IconButton
                  color="inherit"
                  onClick={handleUploadMemory}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <UploadIcon sx={{ color: 'white', fontSize: 28 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Explore Memories" arrow>
                <IconButton
                  color="inherit"
                  onClick={onExplore}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <PlayArrowIcon sx={{ color: 'white', fontSize: 28 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Manage Friends" arrow>
                <IconButton
                  color="inherit"
                  onClick={onFriends}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <GroupIcon sx={{ color: 'white', fontSize: 28 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Logout" arrow>
                <IconButton
                  color="inherit"
                  onClick={handleLogout}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <LogoutIcon sx={{ color: 'white', fontSize: 28 }} />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Get Started" arrow>
              <SmartButton onClick={onJoin}>
                Start
              </SmartButton>
            </Tooltip>
          )}
          <Tooltip title={soundOn ? "Mute Sound" : "Unmute Sound"} arrow>
            <Switch
              checked={soundOn}
              onChange={onSoundToggle}
              icon={<VolumeOffIcon sx={{ color: 'white' }} />}
              checkedIcon={<VolumeUpIcon sx={{ color: 'white' }} />}
            />
          </Tooltip>
        </Box>
      </Toolbar>
    </SmartAppBar>
  );
};

export default Header;