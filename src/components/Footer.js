import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { styled } from '@mui/system';

// Styled Components
const SmartFooter = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100%',
  background: 'linear-gradient(135deg, rgba(107, 72, 255, 0.9), rgba(0, 221, 235, 0.9))',
  color: 'white',
  boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.2)',
  zIndex: 10,
  padding: theme.spacing(1),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const Footer = () => {
  const navigate = useNavigate();

  // Navigation handlers
  const handleViewTimelines = () => {
    navigate('/timelines');
  };

  const handleCreateTimeline = () => {
    navigate('/create-timeline');
  };

  const handleManageMemories = () => {
    navigate('/memories');
  };

  return (
    <SmartFooter>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
        <Tooltip title="View Timelines" arrow>
          <IconButton
            color="inherit"
            onClick={handleViewTimelines}
            sx={{
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
            aria-label="View timelines"
          >
            <TimelineIcon sx={{ color: 'white', fontSize: { xs: 28, sm: 32 } }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Create Timeline" arrow>
          <IconButton
            color="inherit"
            onClick={handleCreateTimeline}
            sx={{
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
            aria-label="Create timeline"
          >
            <AddCircleOutlineIcon sx={{ color: 'white', fontSize: { xs: 28, sm: 32 } }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Manage Memories" arrow>
          <IconButton
            color="inherit"
            onClick={handleManageMemories}
            sx={{
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
            aria-label="Manage memories"
          >
            <PhotoLibraryIcon sx={{ color: 'white', fontSize: { xs: 28, sm: 32 } }} />
          </IconButton>
        </Tooltip>
        <Typography
          variant="body2"
          sx={{
            color: 'white',
            textShadow: '1px 1px 4px rgba(0, 0, 0, 0.3)',
            fontSize: { xs: '0.8rem', sm: '1rem' },
          }}
        >
          © {new Date().getFullYear()} MomentCraft
        </Typography>
      </Box>
    </SmartFooter>
  );
};

export default Footer;