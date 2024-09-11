import { apiCall } from '../wrapper';

const usersBaseUrl = process.env.API_USERS;
const oauthBaseUrl = process.env.API_OAUTH;

export const getGoogleLogin = async () => {
    try {
        const response = await apiCall(oauthBaseUrl, '/google', 'GET');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getDiscordLogin = async () => {
    try {
        const response = await apiCall(oauthBaseUrl, '/discord', 'GET');
        return response;
    } catch (error) {
        throw error;
    }
};

export const postRegister = async (payload: any) => {
    try {
        const response = await apiCall(usersBaseUrl, '/register', 'POST', payload);
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
