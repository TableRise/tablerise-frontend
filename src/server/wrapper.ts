import { WrapperPayload } from '@/types/modules/server/ServerWrapper';
import axios from 'axios';

export const usersBaseUrl = process.env.API_USERS;
export const dndBaseUrl = process.env.API_DD5E;
export const campaignsBaseUrl = process.env.API_CAMPAIGNS;
export const oAuthBaseUrl = process.env.API_OAUTH;

export const apiCall = async (data: WrapperPayload) => {
    const { method, baseUrl, endpoint, data: requestData, params } = data;

    try {
        const response = await axios({
            method,
            url: `${baseUrl}/${endpoint}`,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                [process.env.TYPE_KEY as string]: process.env.API_ACCESS_KEY,
            },
            data: requestData,
            params,
        });
        return response;
    } catch (error) {
        throw error;
    }
};
