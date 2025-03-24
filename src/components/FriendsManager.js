import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
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
} from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AuthContext from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header'; // Import the Header component

const StyledListItem = styled(ListItem)(({ theme }) => ({
  transition: 'background-color 0.3s, opacity 0.3s',
  '&:hover': { backgroundColor: theme?.palette?.grey[100] || '#f5f5f5' },
}));

const FriendsManager = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate(); // Added for navigation
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [soundOn, setSoundOn] = useState(false); // Added for sound toggle

  // Fetch friends and all users
  const fetchFriendsData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);

      // Fetch friends and requests
      const friendsResponse = await axios.get('http://localhost:5000/api/auth/me/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(friendsResponse.data.friends || []);
      setPendingRequests(friendsResponse.data.pendingRequests || []);
      setSentRequests(friendsResponse.data.sentRequests || []);

      // Fetch all users
      const usersResponse = await axios.get('http://localhost:5000/api/auth/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(usersResponse.data || []);
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
  const handleExploreMemories = () => navigate('/memories');
  const handleManageFriends = () => navigate('/friends');
  const handleJoinNow = () => navigate('/register');

  // Send friend request
  const handleSendRequest = async (targetId) => {
    setActionLoading(targetId);
    try {
      await axios.post(
        `http://localhost:5000/api/auth/${targetId}/request`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  // Accept request
  const handleAcceptRequest = async (requesterId) => {
    setActionLoading(requesterId);
    try {
      await axios.post(
        `http://localhost:5000/api/auth/${requesterId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  // Decline request
  const handleDeclineRequest = async (requesterId) => {
    setActionLoading(requesterId);
    try {
      await axios.post(
        `http://localhost:5000/api/auth/${requesterId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingRequests(pendingRequests.filter((r) => r._id !== requesterId));
      toast.success('Friend request declined');
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request');
    } finally {
      setActionLoading(null);
    }
  };

  // Remove friend
  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Remove this friend?')) return;
    setActionLoading(friendId);
    try {
      await axios.delete(`http://localhost:5000/api/auth/${friendId}/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  if (!token) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h6">Please log in to manage friends.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Add Header */}
      <Header
        token={token}
        onExplore={handleExploreMemories}
        onFriends={handleManageFriends}
        soundOn={soundOn}
        onSoundToggle={handleSoundToggle}
        onJoin={handleJoinNow}
      />
      {/* Adjust margin to avoid overlap */}
      <Box sx={{ mt: 8, display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Friends</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchFriendsData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label={`Friends (${friends.length})`} />
        <Tab label={`Pending (${pendingRequests.length})`} />
        <Tab label={`Sent (${sentRequests.length})`} />
        <Tab label={`Discover (${allUsers.length})`} />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Fade in={!loading}>
          <Box>
            {/* Friends Tab */}
            {tabValue === 0 && (
              <>
                <Typography variant="h6" sx={{ mb: 1 }}>Your Friends</Typography>
                {friends.length === 0 ? (
                  <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    No friends yet. Check the Discover tab to connect!
                  </Typography>
                ) : (
                  <List sx={{ maxWidth: 500, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                    {friends.map((friend) => (
                      <React.Fragment key={friend._id}>
                        <StyledListItem
                          sx={{ opacity: actionLoading === friend._id ? 0.5 : 1 }}
                          secondaryAction={
                            <Tooltip title="Remove friend">
                              <IconButton
                                onClick={() => handleRemoveFriend(friend._id)}
                                disabled={actionLoading === friend._id}
                              >
                                {actionLoading === friend._id ? <CircularProgress size={20} /> : <DeleteIcon />}
                              </IconButton>
                            </Tooltip>
                          }
                        >
                          <ListItemAvatar><PersonIcon color="action" /></ListItemAvatar>
                          <ListItemText primary={friend.username} secondary={friend.email || 'No email'} />
                        </StyledListItem>
                        <Divider variant="inset" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </>
            )}

            {/* Pending Requests Tab */}
            {tabValue === 1 && (
              <>
                <Typography variant="h6" sx={{ mb: 1 }}>Pending Requests</Typography>
                {pendingRequests.length === 0 ? (
                  <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    No pending requests.
                  </Typography>
                ) : (
                  <List sx={{ maxWidth: 500, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                    {pendingRequests.map((request) => (
                      <React.Fragment key={request._id}>
                        <StyledListItem
                          sx={{ opacity: actionLoading === request._id ? 0.5 : 1 }}
                          secondaryAction={
                            <Box>
                              <Tooltip title="Accept">
                                <IconButton
                                  onClick={() => handleAcceptRequest(request._id)}
                                  disabled={actionLoading === request._id}
                                >
                                  {actionLoading === request._id ? <CircularProgress size={20} /> : <CheckIcon />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Decline">
                                <IconButton
                                  onClick={() => handleDeclineRequest(request._id)}
                                  disabled={actionLoading === request._id}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          }
                        >
                          <ListItemAvatar><PersonIcon color="action" /></ListItemAvatar>
                          <ListItemText primary={request.username} secondary={request.email || 'No email'} />
                        </StyledListItem>
                        <Divider variant="inset" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </>
            )}

            {/* Sent Requests Tab */}
            {tabValue === 2 && (
              <>
                <Typography variant="h6" sx={{ mb: 1 }}>Sent Requests</Typography>
                {sentRequests.length === 0 ? (
                  <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    No sent requests. Check Discover to send some!
                  </Typography>
                ) : (
                  <List sx={{ maxWidth: 500, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                    {sentRequests.map((request) => (
                      <React.Fragment key={request._id}>
                        <StyledListItem>
                          <ListItemAvatar><PersonIcon color="action" /></ListItemAvatar>
                          <ListItemText primary={request.username} secondary={request.email || 'No email'} />
                        </StyledListItem>
                        <Divider variant="inset" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </>
            )}

            {/* Discover Tab */}
            {tabValue === 3 && (
              <>
                <Typography variant="h6" sx={{ mb: 1 }}>Discover People</Typography>
                {allUsers.length === 0 ? (
                  <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    No new people to connect with.
                  </Typography>
                ) : (
                  <List sx={{ maxWidth: 500, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                    {allUsers.map((user) => (
                      <React.Fragment key={user._id}>
                        <StyledListItem
                          sx={{ opacity: actionLoading === user._id ? 0.5 : 1 }}
                          secondaryAction={
                            <Tooltip title="Send friend request">
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleSendRequest(user._id)}
                                disabled={actionLoading === user._id}
                                startIcon={actionLoading === user._id ? <CircularProgress size={20} /> : <AddIcon />}
                              >
                                Send
                              </Button>
                            </Tooltip>
                          }
                        >
                          <ListItemAvatar><PersonIcon color="action" /></ListItemAvatar>
                          <ListItemText primary={user.username} secondary={user.email || 'No email'} />
                        </StyledListItem>
                        <Divider variant="inset" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </>
            )}
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default FriendsManager;