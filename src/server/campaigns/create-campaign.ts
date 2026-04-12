import { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';
import { campaignsBaseUrl } from '../wrapper';

export interface CreateCampaignPayload {
    title: string;
    description: string;
    system: string;
    ageRestriction: string;
    visibility: string;
    password: string;
}

export const createCampaign = async (payload: CreateCampaignPayload) => {
    try {
        const formData = new FormData();
        formData.append('title', payload.title);
        formData.append('description', payload.description);
        formData.append('system', payload.system);
        formData.append('ageRestriction', payload.ageRestriction);
        formData.append('visibility', payload.visibility);
        formData.append('password', payload.password);

        console.log(payload);

        const { data }: AxiosResponse = await axios({
            method: 'POST',
            url: `${campaignsBaseUrl}/create`,
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
                [process.env.NEXT_PUBLIC_TYPE_KEY as string]:
                    process.env.NEXT_PUBLIC_API_ACCESS_KEY,
            },
            data: formData,
        });

        return data;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        console.log(error);
        if (status === 409) throw new Error('Já existe uma campanha com esse nome');
        if (status === 400) throw new Error('Dados inválidos');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao criar campanha');
    }
};
