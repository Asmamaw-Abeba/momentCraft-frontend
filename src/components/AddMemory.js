import { useParams } from 'react-router-dom';
import axios from 'axios';

const AddMemory = () => {
  const { timelineId } = useParams(); // Get timelineId from the URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    const memoryData = { title: 'Your Title', description: 'Your Description' }; // Replace with form data

    try {
      // Step 1: Create the memory
      const { data: newMemory } = await axios.post('/api/memories', memoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Step 2: If timelineId exists, associate the memory with the timeline
      if (timelineId) {
        await axios.put(
          `/api/timelines/${timelineId}/memories/${newMemory._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      console.log('Memory created and associated with timeline (if provided)');
      // Optionally, redirect or show a success message
    } catch (error) {
      console.error('Error creating memory:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields for title, description, etc. */}
      <button type="submit">Create Memory</button>
    </form>
  );
};

export default AddMemory;