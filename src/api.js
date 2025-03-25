import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api/memories' });
const TimeLine_API = axios.create({ baseURL: 'http://localhost:5000/api/timelines' });
export const fetchMemories = (token) => API.get('/', {
  headers: {
    'Content-Type': 'application/json', // Use 'application/json' for JSON data
    Authorization: `Bearer ${token}`,
  },
});
export const createTimeLine = (data, token) => {
  const response = TimeLine_API.post('/', data, {
    headers: {
      'Content-Type': 'application/json', // Use 'application/json' for JSON data
      Authorization: `Bearer ${token}`,
    },
  });
  return response?.data;
};

// export const createMemory = (formData, onUploadProgress, token) =>
//   API.post('/', formData, {
//    // api.js
export const createMemory = async (formData, onUploadProgress, token) => {
  try {
    const response = await API.post('/', formData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      },
    });
    return response; // Ensure this includes media or _id
  } catch (error) {
    console.error('API Error:', error);
    throw error; // Let frontend handle partial success
  }
};