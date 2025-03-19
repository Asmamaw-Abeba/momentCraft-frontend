import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { Card, CardContent, Typography, Box } from '@mui/material';

const Timeline = () => {
  const { timelineId } = useParams(); // Extract timelineId from the URL
  const [memories, setMemories] = useState([]);

  // Fetch memories for the timeline
  useEffect(() => {
    const fetchMemories = async () => {
      const { data } = await axios.get(`/api/timelines/${timelineId}`);
      setMemories(data?.memories);
    };
    fetchMemories();
  }, [timelineId]);

  // Handle drag-and-drop reordering
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedMemories = Array.from(memories);
    const [removed] = reorderedMemories.splice(result.source.index, 1);
    reorderedMemories.splice(result.destination.index, 0, removed);

    setMemories(reorderedMemories);

    // Update the backend with the new order
    await axios.put(`/api/timelines/${timelineId}/reorder`, {
      memoryIds: reorderedMemories.map((memory) => memory._id),
    });
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Timeline
      </Typography>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="memories">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {memories.map((memory, index) => (
                <Draggable key={memory._id} draggableId={memory._id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card sx={{ marginBottom: 2 }}>
                        <CardContent>
                          <Typography variant="h6">{memory.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {memory.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default Timeline;