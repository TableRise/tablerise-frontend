import axios from 'axios';

export const apiCall = async (
    baseUrl: string | undefined,
    endpoint: string,
    method: string = 'GET',
    data?: any
) => {
    const token = localStorage.getItem('token');

    try {
        const response = await axios({
            method,
            url: `${baseUrl}/${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            data,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
