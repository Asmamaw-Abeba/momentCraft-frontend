import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Avatar,
  Divider,
  Tooltip,
  IconButton,
  Modal,
  TextField,
  Fade,
  useMediaQuery,
  useTheme,
  CircularProgress, // Added import
} from '@mui/material';
import { styled } from '@mui/system';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import ShareIcon from '@mui/icons-material/Share';
import MessageIcon from '@mui/icons-material/Message';
import DeleteIcon from '@mui/icons-material/Delete';

// Styled Components
const ProfileCard = styled(Card)(({ theme }) => ({
  maxWidth: { xs: '100%', sm: 800 },
  margin: 'auto',
  padding: theme.spacing(2, 3),
  borderRadius: 16,
  boxShadow: theme?.shadows?.[4] || '0 4px 12px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#fff',
  overflow: 'hidden',
}));

const StyledTimelineCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: theme?.shadows?.[8] || '0px 8px 16px rgba(0, 0, 0, 0.2)',
  },
  borderRadius: 12,
  overflow: 'hidden',
  height: '100%',
}));

const ModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
  borderRadius: 8,
  maxHeight: '80vh',
  overflowY: 'auto',
}));

const FriendProfile = () => {
  const { token } = useContext(AuthContext);
  const { friendId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [friend, setFriend] = useState(null);
  const [sharedTimelines, setSharedTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [openMessageModal, setOpenMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleSoundToggle = () => setSoundOn((prev) => !prev);
  const handleExploreMemories = () => navigate('/best-memories');
  const handleManageFriends = () => navigate('/friends');
  const handleJoinNow = () => navigate('/register');

  useEffect(() => {
    const fetchFriendData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const friendResponse = await axios.get(`https://momentcraft-backend.onrender.com/api/auth/profile/${friendId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriend(friendResponse.data);

        const timelinesResponse = await axios.get(
          `https://momentcraft-backend.onrender.com/api/auth/me/shared-timelines/${friendId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSharedTimelines(timelinesResponse.data || []);
      } catch (error) {
        console.error('Error fetching friend data:', error);
        toast.error('Failed to load friend profile');
      } finally {
        setLoading(false);
      }
    };
    fetchFriendData();
  }, [token, friendId]);

  const handleViewTimeline = (timelineId) => {
    navigate(`/timeline/public/${timelineId}`);
  };

  // Messaging Functions
  const handleOpenMessageModal = () => setOpenMessageModal(true);
  const handleCloseMessageModal = () => {
    setOpenMessageModal(false);
    setMessageText('');
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.warn('Please enter a message');
      return;
    }
    setSendingMessage(true);
    try {
      await axios.post(
        `https://momentcraft-backend.onrender.com/api/messages/send/${friendId}`,
        { content: messageText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Message sent to ${friend.username}!`);
      handleCloseMessageModal();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Remove Friend Function
  const handleRemoveFriend = async () => {
    if (!window.confirm(`Remove ${friend.username} as a friend?`)) return;
    setActionLoading(true);
    try {
      await axios.delete(`https://momentcraft-backend.onrender.com/api/auth/${friendId}/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${friend.username} has been removed as a friend`);
      navigate('/friends');
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    } finally {
      setActionLoading(false);
    }
  };

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Header token={token} onExplore={handleExploreMemories} onFriends={handleManageFriends} soundOn={soundOn} onSoundToggle={handleSoundToggle} onJoin={handleJoinNow} />
        <Box sx={{ textAlign: 'center', mt: { xs: 6, sm: 8 }, px: 2 }}>
          <Typography variant="h6">Please log in to view profiles.</Typography>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', padding: { xs: 2, sm: 3 } }}>
        <Header token={token} onExplore={handleExploreMemories} onFriends={handleManageFriends} soundOn={soundOn} onSoundToggle={handleSoundToggle} onJoin={handleJoinNow} />
        <Box sx={{ mt: { xs: 6, sm: 8 }, maxWidth: { xs: '100%', sm: 800 }, margin: 'auto', px: 2 }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ margin: 'auto' }} />
          <Skeleton variant="text" width="60%" sx={{ mt: 2, margin: 'auto' }} />
          <Skeleton variant="text" width="40%" sx={{ margin: 'auto' }} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 4, borderRadius: 12 }} />
        </Box>
      </Box>
    );
  }

  if (!friend) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', padding: { xs: 2, sm: 3 } }}>
        <Header token={token} onExplore={handleExploreMemories} onFriends={handleManageFriends} soundOn={soundOn} onSoundToggle={handleSoundToggle} onJoin={handleJoinNow} />
        <Box sx={{ textAlign: 'center', mt: { xs: 6, sm: 8 }, px: 2 }}>
          <Typography variant="h6">Friend not found.</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Header token={token} onExplore={handleExploreMemories} onFriends={handleManageFriends} soundOn={soundOn} onSoundToggle={handleSoundToggle} onJoin={handleJoinNow} />
      <Box sx={{ padding: { xs: 2, sm: 3 }, mt: { xs: 6, sm: 8 } }}>
        <ProfileCard>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'center' }, gap: 3, mb: 3 }}>
            <Avatar
              sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, bgcolor: '#1976d2' }}
              alt={friend.username}
              src={friend.avatar || ''}
            >
              {friend.username?.[0]?.toUpperCase() || 'F'}
            </Avatar>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flexGrow: 1 }}>
              <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 'bold', color: '#333' }}>
                {friend.username}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {friend.email || 'No email provided'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
              <Tooltip title="Send Message">
                <IconButton onClick={handleOpenMessageModal} color="primary" disabled={actionLoading}>
                  <MessageIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove Friend">
                <IconButton onClick={handleRemoveFriend} color="error" disabled={actionLoading}>
                  {actionLoading ? <CircularProgress size={24} /> : <DeleteIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4} sm={3}>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>{friend.friends?.length || 0}</Typography>
              <Typography variant="body2" color="textSecondary">Friends</Typography>
            </Grid>
            <Grid item xs={4} sm={3}>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>{friend.memoriesCount || 0}</Typography>
              <Typography variant="body2" color="textSecondary">Memories</Typography>
            </Grid>
            <Grid item xs={4} sm={3}>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>{sharedTimelines.length}</Typography>
              <Typography variant="body2" color="textSecondary">Shared Timelines</Typography>
            </Grid>
          </Grid>

          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', mb: 2 }}>
            Shared Timelines
          </Typography>
          {sharedTimelines.length === 0 ? (
            <Typography color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
              No timelines shared with you by {friend.username}.
            </Typography>
          ) : (
            <Grid container spacing={isMobile ? 2 : 3}>
              {sharedTimelines.map((timeline) => (
                <Grid item xs={12} sm={6} md={4} key={timeline._id}>
                  <StyledTimelineCard>
                    <CardMedia
                      component="img"
                      height={isMobile ? 120 : 140}
                      image={timeline.memories[0]?.media || 'https://via.placeholder.com/150'}
                      alt={timeline.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant={isMobile ? 'body1' : 'h6'} sx={{ fontWeight: 'medium' }}>
                        {timeline.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {timeline.description || 'No description'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Memories: {timeline.memories.length}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="View Timeline">
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleViewTimeline(timeline._id)}
                            startIcon={<ShareIcon />}
                            sx={{ borderRadius: 20 }}
                          >
                            View
                          </Button>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </StyledTimelineCard>
                </Grid>
              ))}
            </Grid>
          )}
        </ProfileCard>
      </Box>

      {/* Message Modal */}
      <Modal open={openMessageModal} onClose={handleCloseMessageModal} closeAfterTransition>
        <Fade in={openMessageModal}>
          <ModalBox>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
              Send Message to {friend.username}
            </Typography>
            <TextField
              label="Message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              fullWidth
              multiline
              rows={isMobile ? 3 : 4}
              variant="outlined"
              sx={{ mb: 2 }}
              disabled={sendingMessage}
              aria-label="Message input"
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendMessage}
                disabled={sendingMessage}
                sx={{ minWidth: 80 }}
              >
                {sendingMessage ? <CircularProgress size={24} /> : 'Send'}
              </Button>
              <Button variant="outlined" onClick={handleCloseMessageModal} disabled={sendingMessage}>
                Cancel
              </Button>
            </Box>
          </ModalBox>
        </Fade>
      </Modal>
    </Box>
  );
};

export default FriendProfile;