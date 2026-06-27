import axios from 'axios';

const API = axios.create({ baseURL: 'https://ai-study-assistant-l9cm.onrender.com/api' });

export const uploadPDF = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getDocuments = () => API.get('/documents');
export const getDocument = (id) => API.get(`/documents/${id}`);
export const deleteDocument = (id) => API.delete(`/documents/${id}`);
export const generateReviewer = (text, mode, documentId) =>
  API.post('/reviewer/generate', { text, mode, documentId });