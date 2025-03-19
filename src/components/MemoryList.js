import React, { useEffect, useState } from 'react';
import { fetchMemories } from '../api';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';

const MemoryList = ({ refresh }) => {
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    const getMemories = async () => {
      const { data } = await fetchMemories();
      setMemories(data);
    };
    getMemories();
  }, [refresh]);

   // Function to check if a file is a video
   const isVideo = (filename) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Memories
      </Typography>
      <Grid container spacing={3}>
        {memories.map((memory) => (
          <Grid item key={memory._id} xs={12} sm={6} md={4}>
            <Card>
              {isVideo(memory.media) ? (
                <video
                  controls
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                >
                  <source src={`${memory.media}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={`http://localhost:5000/${memory.media}`}
                  alt={memory.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Typography variant="h6">{memory.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {memory.description}
                </Typography>
                {/* Display the AI-generated caption for images */}
                {!memory.isVideo && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                    <strong>AI Caption:</strong> {memory.caption || "No caption available."}
                  </Typography>
                )}
                {/* Display the AI-generated summary for videos */}
                {memory.isVideo && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                    <strong>AI Summary:</strong> {memory.summary || "No summary available."}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MemoryList;