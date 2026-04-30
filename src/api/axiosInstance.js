import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jobindia.ai/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
//https://arpeggioed-anaya-nonostensively.ngrok-free.dev/
//https://floralwhite-louse-700260.hostingersite.com   //   https://jobindia.ai/
export default api;