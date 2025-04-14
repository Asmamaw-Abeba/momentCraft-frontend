import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Typography, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const CreateTimeline = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      setError('Name and description are required.');
      setOpenSnackbar(true);
      return;
    }

    if (!token) {
      setError('You must be logged in to create a timeline.');
      setOpenSnackbar(true);
      return;
    }

    console.log('Token:', token);
    console.log('Request Payload:', { name, description });

    try {
      const response = await axios.post(
        'https://momentcraft-backend.onrender.com/api/timelines',
        { name, description },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Full Response:', response);

      // Check response.data for the timeline object and _id
      if (!response || !response.data || !response.data._id) {
        throw new Error('Invalid response from server: _id is missing');
      }

      setName('');
      setDescription('');
      setError('Timeline created successfully!');
      setOpenSnackbar(true);
      navigate(`/timelines/${response.data._id}`); // Use response.data._id
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to create timeline');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ maxWidth: 500, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create a Timeline
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Create Timeline
        </Button>
      </form>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error.includes('successfully') ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateTimeline;