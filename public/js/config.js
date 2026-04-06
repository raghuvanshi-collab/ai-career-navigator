// config.js
// This file centralizes the API Base URL so it can be updated in one place.

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api'
    : 'https://YOUR_BACKEND_APP_NAME.onrender.com/api'; // <--- REPLACE THIS LATER WITH YOUR ACTUAL RENDER URL

// We assign it to window so it's easily accessible in all scripts
window.API_BASE_URL = API_BASE_URL;
