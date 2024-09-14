import axios from 'axios';

export const apiCall = async (
    baseUrl: string | undefined,
    endpoint: string,
    method: string = 'GET',
    data?: any
) => {
    try {
        const response = await axios({
            method,
            url: `${baseUrl}/${endpoint}`,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            data,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
