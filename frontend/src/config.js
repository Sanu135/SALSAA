const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://salsaa-1.onrender.com/api'
  : 'http://localhost:8000/api';

export default API_URL;
