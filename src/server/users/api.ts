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
