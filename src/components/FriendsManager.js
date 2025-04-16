import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  CircularProgress,
  Fade,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  TextField,
  InputAdornment,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ShareIcon from '@mui/icons-material/Share';
import AuthContext from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';

// Styled Components
const StyledListItem = styled(ListItem)(({ theme }) => ({
  transition: 'background-color 0.3s, opacity 0.3s',
  '&:hover': { backgroundColor: theme?.palette?.grey[100] || '#f5f5f5' },
  borderRadius: 8,
  marginBottom: theme.spacing(1),
}));

const StyledTabContent = styled(Box)(({ theme }) => ({
  maxWidth: { xs: '100%', sm: 600, md: 800 }, // Responsive maxWidth
  margin: 'auto',
  bgcolor: 'white',
  borderRadius: 8,
  boxShadow: theme?.shadows?.[2] || '0 2px 10px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(2),
  overflowY: 'auto', // Scrollable content on small screens
  maxHeight: { xs: 'calc(100vh - 200px)', md: 'none' }, // Limit height on mobile
}));

const ResponsiveTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-flexContainer': {
    flexWrap: { xs: 'wrap', sm: 'nowrap' }, // Wrap tabs on small screens
    justifyContent: { xs: 'center', sm: 'flex-start' },
  },
  '& .MuiTab-root': {
    minWidth: { xs: 60, sm: 100 }, // Smaller tabs on mobile
    padding: theme.spacing(1),
  },
}));

const FriendsManager = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect mobile screens
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundOn, setSoundOn] = useState(false);

  // Fetch data
  const fetchFriendsData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const friendsResponse = await axios.get('https://momentcraft-backend.onrender.com/api/auth/me/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(friendsResponse.data.friends || []);
      setPendingRequests(friendsResponse.data.pendingRequests || []);
      setSentRequests(friendsResponse.data.sentRequests || []);

      const usersResponse = await axios.get('https://momentcraft-backend.onrender.com/api/auth/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(usersResponse.data || []);

      const sharedResponse = await axios.get('https://momentcraft-backend.onrender.com/api/auth/me/shared-timelines', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(sharedResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFriendsData();
  }, [fetchFriendsData]);

  // Navigation handlers
  const handleSoundToggle = () => setSoundOn((prev) => !prev);
  const handleExploreMemories = () => navigate('/best-memories');
  const handleManageFriends = () => navigate('/friends');
  const handleJoinNow = () => navigate('/register');

  // Friend request actions
  const handleSendRequest = async (targetId) => {
    setActionLoading(targetId);
    try {
      await axios.post(`https://momentcraft-backend.onrender.com/api/auth/${targetId}/request`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const targetUser = allUsers.find((u) => u._id === targetId);
      setSentRequests([...sentRequests, targetUser]);
      setAllUsers(allUsers.filter((u) => u._id !== targetId));
      toast.success(`Request sent to ${targetUser.username}`);
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptRequest = async (requesterId) => {
    setActionLoading(requesterId);
    try {
      await axios.post(`https://momentcraft-backend.onrender.com/api/auth/${requesterId}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const accepted = pendingRequests.find((r) => r._id === requesterId);
      setPendingRequests(pendingRequests.filter((r) => r._id !== requesterId));
      setFriends([...friends, accepted]);
      toast.success('Friend request accepted');
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineRequest = async (requesterId) => {
    setActionLoading(requesterId);
    try {
      await axios.post(`https://momentcraft-backend.onrender.com/api/auth/${requesterId}/decline`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setPendingRequests(pendingRequests.filter((r) => r._id !== requesterId));
      toast.success('Friend request declined');
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Remove this friend?')) return;
    setActionLoading(friendId);
    try {
      await axios.delete(`https://momentcraft-backend.onrender.com/api/auth/${friendId}/friends`, { headers: { Authorization: `Bearer ${token}` } });
      const removedFriend = friends.find((f) => f._id === friendId);
      setFriends(friends.filter((f) => f._id !== friendId));
      setAllUsers([...allUsers, removedFriend]);
      toast.success('Friend removed');
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter friends
  const filteredFriends = friends.filter(
    (friend) =>
      friend.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter discover users
  const filteredUsers = allUsers.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Header token={token} onExplore={handleExploreMemories} onFriends={handleManageFriends} soundOn={soundOn} onSoundToggle={handleSoundToggle} onJoin={handleJoinNow} />
        <Box sx={{ textAlign: 'center', mt: 8, px: 2 }}>
          <Typography variant="h6">Please log in to manage friends.</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Header token={token} onExplore={handleExploreMemories} onFriends={handleManageFriends} soundOn={soundOn} onSoundToggle={handleSoundToggle} onJoin={handleJoinNow} />
      <Box sx={{ mt: { xs: 6, sm: 8 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', textAlign: { xs: 'center', sm: 'left' } }}>
            Friends Manager
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchFriendsData} disabled={loading} sx={{ bgcolor: '#1976d2', color: 'white', '&:hover': { bgcolor: '#1565c0' } }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <ResponsiveTabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant={isMobile ? 'scrollable' : 'standard'} scrollButtons="auto">
          <Tab label={<Badge badgeContent={friends.length} color="primary">Friends</Badge>} />
          <Tab label={<Badge badgeContent={pendingRequests.length} color="warning">Pending</Badge>} />
          <Tab label={<Badge badgeContent={sentRequests.length} color="info">Sent</Badge>} />
          <Tab label={<Badge badgeContent={allUsers.length} color="secondary">Discover</Badge>} />
          <Tab label={<Badge badgeContent={notifications.length} color="success">Notifications</Badge>} />
        </ResponsiveTabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Fade in={!loading}>
            <StyledTabContent>
              {/* Friends Tab */}
              {tabValue === 0 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>Your Friends</Typography>
                  <TextField
                    label="Search Friends"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mb: 2 }}
                    InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment> }}
                    aria-label="Search friends"
                  />
                  {filteredFriends.length === 0 ? (
                    <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                      {searchQuery ? 'No matching friends found.' : 'No friends yet. Check the Discover tab to connect!'}
                    </Typography>
                  ) : (
                    <List>
                      {filteredFriends.map((friend) => (
                        <React.Fragment key={friend._id}>
                          <StyledListItem
                            sx={{ opacity: actionLoading === friend._id ? 0.5 : 1, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'start', sm: 'center' } }}
                            secondaryAction={
                              <Box sx={{ display: 'flex', gap: 1, mt: { xs: 1, sm: 0 } }}>
                                <Tooltip title="View Profile">
                                  <IconButton component={Link} to={`/profile/${friend._id}`} color="info">
                                    <ShareIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Remove Friend">
                                  <IconButton onClick={() => handleRemoveFriend(friend._id)} disabled={actionLoading === friend._id}>
                                    {actionLoading === friend._id ? <CircularProgress size={20} /> : <DeleteIcon />}
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            }
                          >
                            <ListItemAvatar sx={{ minWidth: { xs: 40, sm: 56 } }}>
                              <PersonIcon color="action" />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Link to={`/profile/${friend._id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                                  {friend.username}
                                </Link>
                              }
                              secondary={friend.email || 'No email'}
                              primaryTypographyProps={{ variant: isMobile ? 'body1' : 'h6', fontWeight: 'medium' }}
                            />
                          </StyledListItem>
                          <Divider variant="inset" sx={{ display: { xs: 'none', sm: 'block' } }} />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </>
              )}

              {/* Pending Requests Tab */}
              {tabValue === 1 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>Pending Requests</Typography>
                  {pendingRequests.length === 0 ? (
                    <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                      No pending requests.
                    </Typography>
                  ) : (
                    <List>
                      {pendingRequests.map((request) => (
                        <React.Fragment key={request._id}>
                          <StyledListItem
                            sx={{ opacity: actionLoading === request._id ? 0.5 : 1, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'start', sm: 'center' } }}
                            secondaryAction={
                              <Box sx={{ display: 'flex', gap: 1, mt: { xs: 1, sm: 0 } }}>
                                <Tooltip title="Accept">
                                  <IconButton onClick={() => handleAcceptRequest(request._id)} disabled={actionLoading === request._id}>
                                    {actionLoading === request._id ? <CircularProgress size={20} /> : <CheckIcon />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Decline">
                                  <IconButton onClick={() => handleDeclineRequest(request._id)} disabled={actionLoading === request._id}>
                                    <CloseIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            }
                          >
                            <ListItemAvatar sx={{ minWidth: { xs: 40, sm: 56 } }}>
                              <PersonIcon color="action" />
                            </ListItemAvatar>
                            <ListItemText
                              primary={request.username}
                              secondary={request.email || 'No email'}
                              primaryTypographyProps={{ variant: isMobile ? 'body1' : 'h6', fontWeight: 'medium' }}
                            />
                          </StyledListItem>
                          <Divider variant="inset" sx={{ display: { xs: 'none', sm: 'block' } }} />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </>
              )}

              {/* Sent Requests Tab */}
              {tabValue === 2 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>Sent Requests</Typography>
                  {sentRequests.length === 0 ? (
                    <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                      No sent requests. Check Discover to send some!
                    </Typography>
                  ) : (
                    <List>
                      {sentRequests.map((request) => (
                        <React.Fragment key={request._id}>
                          <StyledListItem sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'start', sm: 'center' } }}>
                            <ListItemAvatar sx={{ minWidth: { xs: 40, sm: 56 } }}>
                              <PersonIcon color="action" />
                            </ListItemAvatar>
                            <ListItemText
                              primary={request.username}
                              secondary={request.email || 'No email'}
                              primaryTypographyProps={{ variant: isMobile ? 'body1' : 'h6', fontWeight: 'medium' }}
                            />
                          </StyledListItem>
                          <Divider variant="inset" sx={{ display: { xs: 'none', sm: 'block' } }} />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </>
              )}

              {/* Discover Tab */}
              {tabValue === 3 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>Discover People</Typography>
                  <TextField
                    label="Search People"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mb: 2 }}
                    InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment> }}
                    aria-label="Search people"
                  />
                  {filteredUsers.length === 0 ? (
                    <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                      {searchQuery ? 'No matching users found.' : 'No new people to connect with.'}
                    </Typography>
                  ) : (
                    <List>
                      {filteredUsers.map((user) => (
                        <React.Fragment key={user._id}>
                          <StyledListItem
                            sx={{ opacity: actionLoading === user._id ? 0.5 : 1, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'start', sm: 'center' } }}
                            secondaryAction={
                              <Tooltip title="Send Friend Request">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleSendRequest(user._id)}
                                  disabled={actionLoading === user._id}
                                  startIcon={actionLoading === user._id ? <CircularProgress size={20} /> : <AddIcon />}
                                  sx={{ mt: { xs: 1, sm: 0 } }}
                                >
                                  Send
                                </Button>
                              </Tooltip>
                            }
                          >
                            <ListItemAvatar sx={{ minWidth: { xs: 40, sm: 56 } }}>
                              <PersonIcon color="action" />
                            </ListItemAvatar>
                            <ListItemText
                              primary={user.username}
                              secondary={user.email || 'No email'}
                              primaryTypographyProps={{ variant: isMobile ? 'body1' : 'h6', fontWeight: 'medium' }}
                            />
                          </StyledListItem>
                          <Divider variant="inset" sx={{ display: { xs: 'none', sm: 'block' } }} />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </>
              )}

              {/* Notifications Tab */}
              {tabValue === 4 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>Notifications</Typography>
                  {notifications.length === 0 ? (
                    <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                      No shared timelines yet.
                    </Typography>
                  ) : (
                    <List>
                      {notifications.map((timeline) => (
                        <React.Fragment key={timeline._id}>
                          <StyledListItem
                            sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'start', sm: 'center' } }}
                            secondaryAction={
                              <Tooltip title="View Shared Timeline">
                                <IconButton component={Link} to={`/timeline/public/${timeline._id}`} color="primary">
                                  <ShareIcon />
                                </IconButton>
                              </Tooltip>
                            }
                          >
                            <ListItemAvatar sx={{ minWidth: { xs: 40, sm: 56 } }}>
                              <PersonIcon color="action" />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Link to={`/timeline/public/${timeline._id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                                  {timeline.name}
                                </Link>
                              }
                              secondary={
                                timeline.sharedBy
                                  ? `Shared by ${timeline.sharedBy.username || timeline.sharedBy.email} - ${timeline.memories.length} memories`
                                  : 'No sharer info'
                              }
                              primaryTypographyProps={{ variant: isMobile ? 'body1' : 'h6', fontWeight: 'medium' }}
                            />
                          </StyledListItem>
                          <Divider variant="inset" sx={{ display: { xs: 'none', sm: 'block' } }} />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </>
              )}
            </StyledTabContent>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default FriendsManager;