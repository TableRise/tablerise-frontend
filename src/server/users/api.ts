import { apiCall } from '../wrapper';

const usersBaseUrl = process.env.API_USERS;

export const postRegister = async (payload: any) => {
    try {
        const response = await apiCall(usersBaseUrl, 'register', 'POST', payload);
        return response;
    } catch (error) {
        throw error;
    }
};
export const postLogin = async (payload: any) => {
    try {
        const response = await apiCall(usersBaseUrl, '/login', 'POST', payload);
        return response;
    } catch (error) {
        throw error;
    }
};
