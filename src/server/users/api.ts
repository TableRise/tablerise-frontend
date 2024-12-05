import axios from 'axios';

export const apiUser = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_USERS,
    headers: {
        [`${process.env.NEXT_PUBLIC_TYPE_KEY}`]: process.env.NEXT_PUBLIC_API_ACCESS_KEY, // Acessa a variável do .env
    },
});
