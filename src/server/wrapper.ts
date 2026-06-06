import { WrapperPayload } from '@/types/modules/server/ServerWrapper';
import axios from 'axios';

export const usersBaseUrl = process.env.API_USERS;
export const dndBaseUrl = process.env.API_DD5E;
export const campaignsBaseUrl = process.env.API_CAMPAIGNS;
export const oAuthBaseUrl = process.env.API_OAUTH;
export const charactersBaseUrl = process.env.API_CHARACTERS;

const AUTH_401_REDIRECT_KEY = 'tablerise-auth-401-redirect';

if (typeof window !== 'undefined') {
    axios.interceptors.response.use(
        (response) => {
            window.sessionStorage.removeItem(AUTH_401_REDIRECT_KEY);
            return response;
        },
        async (error) => {
            const is401 = error?.response?.status === 401;
            const isLogoutUrl = error?.config?.url?.includes('/logout');
            const isLoginUrl = error?.config?.url?.includes('/login');
            const isAuthenticationFlowUrl =
                error?.config?.url?.includes('/authenticate/');
            const alreadyHandling401 =
                window.sessionStorage.getItem(AUTH_401_REDIRECT_KEY) === '1';

            if (
                is401 &&
                !alreadyHandling401 &&
                !isLogoutUrl &&
                !isLoginUrl &&
                !isAuthenticationFlowUrl
            ) {
                window.sessionStorage.setItem(AUTH_401_REDIRECT_KEY, '1');
                window.localStorage.removeItem('userLogged');
                try {
                    await axios.get(`${usersBaseUrl}/logout`, {
                        withCredentials: true,
                    });
                } catch {
                    // ignore logout errors — redirect regardless
                }
                window.location.replace('/login');
            }

            return Promise.reject(error);
        }
    );
}

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
            },
            data: requestData,
            params,
        });
        return response;
    } catch (error) {
        throw error;
    }
};
