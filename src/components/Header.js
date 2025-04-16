import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Switch,
  Box,
  Tooltip,
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
  fontSize: { xs: '1rem', sm: '1.2rem' },
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

const Header = ({
  token: externalToken,
  onExplore: externalOnExplore,
  onFriends: externalOnFriends,
  soundOn: externalSoundOn,
  onSoundToggle: externalOnSoundToggle,
  onJoin: externalOnJoin,
}) => {
  const { token: contextToken, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [localSoundOn, setLocalSoundOn] = useState(false);

  // Use external token if provided, otherwise fall back to context token
  const effectiveToken = externalToken !== undefined ? externalToken : contextToken;

  // Sound toggle handler
  const handleSoundToggle = () => {
    if (externalOnSoundToggle) {
      externalOnSoundToggle();
    } else {
      setLocalSoundOn((prev) => !prev);
    }
  };

  // Effective sound state (external or local)
  const soundOn = externalSoundOn !== undefined ? externalSoundOn : localSoundOn;

  // Navigation handlers with defaults
  const handleExplore = () => {
    if (externalOnExplore) {
      externalOnExplore();
    } else {
      navigate('/best-memories');
    }
  };

  const handleFriends = () => {
    if (externalOnFriends) {
      externalOnFriends();
    } else {
      navigate('/friends');
    }
  };

  const handleJoin = () => {
    if (externalOnJoin) {
      externalOnJoin();
    } else {
      navigate('/register');
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
  };

  const handleUploadMemory = () => {
    navigate('/add-memory');
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <SmartAppBar>
      <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        {/* Left: Title */}
        <Tooltip title="Go to Home" arrow>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              textShadow: '1px 1px 4px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem' },
            }}
            onClick={handleHome}
          >
            MomentCraft
          </Typography>
        </Tooltip>

        {/* Right: Navigation, Logout, and Sound Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap' }}>
          {effectiveToken ? (
            <>
              <Tooltip title="Upload a Memory" arrow>
                <IconButton
                  color="inherit"
                  onClick={handleUploadMemory}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <UploadIcon sx={{ color: 'white', fontSize: { xs: 24, sm: 28 } }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Explore Memories" arrow>
                <IconButton
                  color="inherit"
                  onClick={handleExplore}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <PlayArrowIcon sx={{ color: 'white', fontSize: { xs: 24, sm: 28 } }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Manage Friends" arrow>
                <IconButton
                  color="inherit"
                  onClick={handleFriends}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <GroupIcon sx={{ color: 'white', fontSize: { xs: 24, sm: 28 } }} />
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
                  <LogoutIcon sx={{ color: 'white', fontSize: { xs: 24, sm: 28 } }} />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Get Started" arrow>
              <SmartButton onClick={handleJoin}>
                Start
              </SmartButton>
            </Tooltip>
          )}
          <Tooltip title={soundOn ? 'Mute Sound' : 'Unmute Sound'} arrow>
            <Switch
              checked={soundOn}
              onChange={handleSoundToggle}
              icon={<VolumeOffIcon sx={{ color: 'white' }} />}
              checkedIcon={<VolumeUpIcon sx={{ color: 'white' }} />}
              sx={{ ml: { xs: 0, sm: 1 } }}
            />
          </Tooltip>
        </Box>
      </Toolbar>
    </SmartAppBar>
  );
};

export default Header;