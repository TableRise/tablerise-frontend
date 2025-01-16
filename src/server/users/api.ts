import { apiCall } from '../wrapper';
import axios from 'axios';

const usersBaseUrl = process.env.API_USERS;

export const postRegister = async (payload: any) => {
    try {
        const response = await apiCall(usersBaseUrl, 'register', 'POST', payload);
        return response;
    } catch (error) {
        throw error;
    }
};

export const apiUser = axios.create({
    baseURL: process.env.API_USERS,
    headers: {
        [`${process.env.TYPE_KEY}`]: process.env.API_ACCESS_KEY, // Acessa a variável do .env
    },
});
