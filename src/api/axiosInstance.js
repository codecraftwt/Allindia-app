import axios from 'axios';

const api = axios.create({
  baseURL: 'https://floralwhite-louse-700260.hostingersite.com/',
  headers: {
    'Content-Type': 'application/json',  
  },
});

export default api;