import { apiCall } from '../wrapper';

const usersBaseUrl = process.env.API_USERS;

export const postRegister = async (payload: any) => {
    try {
        const { data } = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'register',
            method: 'POST',
            data: payload,
        });
        return data;
    } catch (error) {
        throw error;
    }
};
