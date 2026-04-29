import axios from 'axios';

const api = axios.create({
  baseURL: 'https://floralwhite-louse-700260.hostingersite.com/',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 70|WiqykHCj21mygSySHXgscq9Nkd0XF72wMmB3txxae930fa23',
    'baseurl': 'https://floralwhite-louse-700260.hostingersite.com/',
  },
});


//https://floralwhite-louse-700260.hostingersite.com
//https://arpeggioed-anaya-nonostensively.ngrok-free.dev
export default api;