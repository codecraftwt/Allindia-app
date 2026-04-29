import axios from 'axios';

const api = axios.create({
  baseURL: 'https://arpeggioed-anaya-nonostensively.ngrok-free.dev/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
//https://arpeggioed-anaya-nonostensively.ngrok-free.dev/
//https://floralwhite-louse-700260.hostingersite.com
export default api;