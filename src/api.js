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

export const createMemory = (formData, onUploadProgress, token) =>
  API.post('/', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
       Authorization: `Bearer ${token}`,  
     },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onUploadProgress(percentCompleted);
    },
  });