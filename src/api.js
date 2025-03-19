import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api/memories' });

export const fetchMemories = () => API.get('/');
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