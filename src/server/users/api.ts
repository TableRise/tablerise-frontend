import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://127.0.0.1:3001/users',
    headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000/',
        'Content-Type': 'application/json',
    },
    method: 'POST',
});
