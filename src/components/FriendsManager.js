import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  CircularProgress,
  Fade,
  Tooltip,
  Autocomplete,
  Divider,
} from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import AuthContext from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import debounce from 'lodash/debounce'; // Install: npm install lodash

// Styled Components
const StyledListItem = styled(ListItem)(({ theme }) => ({
  transition: 'background-color 0.3s, opacity 0.3s',
  '&:hover': {
    backgroundColor: theme?.palette?.grey[100] || '#f5f5f5',
  },
}));

const FriendsManager = () => {
  const { token } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [newFriendInput, setNewFriendInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(null); // Track removal loading per friend

  // Fetch friends
  const fetchFriends = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/auth/me/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(response.data || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch friends');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial fetch and refresh
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Debounced search for user suggestions
  const searchUsers = debounce(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auth/search?username=${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const user = response.data;
      setSuggestions(user ? [user] : []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSuggestions([]);
    }
  }, 300);

  // Handle input change with suggestions
  const handleInputChange = (event, value) => {
    setNewFriendInput(value);
    searchUsers(value);
  };

  // Add a friend
  const handleAddFriend = async () => {
    if (!newFriendInput.trim()) {
      toast.warn('Please select a user');
      return;
    }

    const selectedFriend = suggestions.find((s) => s.username === newFriendInput);
    if (!selectedFriend) {
      toast.error('User not found');
      return;
    }
    if (friends.some((f) => f._id === selectedFriend._id)) {
      toast.warn(`${selectedFriend.username} is already your friend`);
      return;
    }

    setAddLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/api/auth/${selectedFriend._id}/friends`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFriends([...friends, selectedFriend]);
      setNewFriendInput('');
      setSuggestions([]);
      toast.success(`${selectedFriend.username} added as a friend!`);
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error(error.response?.data?.message || 'Failed to add friend');
    } finally {
      setAddLoading(false);
    }
  };

  // Remove a friend
  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Remove this friend?')) return;

    setRemoveLoading(friendId);
    try {
      await axios.delete(`http://localhost:5000/api/auth/${friendId}/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(friends.filter((f) => f._id !== friendId));
      toast.success('Friend removed');
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    } finally {
      setRemoveLoading(null);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Friends</Typography>
        <Tooltip title="Refresh friends list">
          <IconButton onClick={fetchFriends} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Add friends to share private memories with them.
      </Typography>

      {/* Add Friend Form */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, maxWidth: 500 }}>
        <Autocomplete
          freeSolo
          options={suggestions.map((s) => s.username)}
          inputValue={newFriendInput}
          onInputChange={handleInputChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Add a Friend"
              variant="outlined"
              fullWidth
              disabled={addLoading}
              helperText="Type a username to search"
            />
          )}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddFriend}
          disabled={addLoading || loading}
          startIcon={addLoading ? <CircularProgress size={20} /> : <AddIcon />}
          sx={{ minWidth: 100 }}
        >
          Add
        </Button>
      </Box>

      {/* Friends List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Fade in={!loading}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Your Friends ({friends.length})
            </Typography>
            {friends.length === 0 ? (
              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                No friends yet. Start by adding someone!
              </Typography>
            ) : (
              <List sx={{ maxWidth: 500, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                {friends.map((friend) => (
                  <React.Fragment key={friend._id}>
                    <StyledListItem
                      sx={{ opacity: removeLoading === friend._id ? 0.5 : 1 }}
                      secondaryAction={
                        <Tooltip title="Remove friend">
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveFriend(friend._id)}
                            disabled={removeLoading === friend._id}
                          >
                            {removeLoading === friend._id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemAvatar>
                        <PersonIcon color="action" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={friend.username}
                        secondary={friend.email || 'No email'}
                      />
                    </StyledListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default FriendsManager;