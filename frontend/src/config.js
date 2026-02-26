const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://salsa-analysis-engine2.onrender.com/api'
  : 'http://localhost:8000/api';

export default API_URL;
