import axios from 'axios';
import { charactersBaseUrl } from '../wrapper';
import {
    appendUploadImageValue,
    type UploadImageValue,
} from '@/utils/imageUploadPayload';

export const uploadCharacterPicture = async (
    characterId: string,
    file: UploadImageValue
): Promise<boolean> => {
    try {
        const formData = new FormData();
        appendUploadImageValue(formData, 'picture', file);

        await axios({
            method: 'POST',
            url: `${charactersBaseUrl}/${characterId}/picture`,
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
        });

        return true;
    } catch {
        return false;
    }
};
