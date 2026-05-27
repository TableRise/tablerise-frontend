import axios from 'axios';
import { charactersBaseUrl } from '../wrapper';

export const uploadCharacterPicture = async (
    characterId: string,
    file: File
): Promise<boolean> => {
    try {
        const formData = new FormData();
        formData.append('picture', file);

        await axios({
            method: 'POST',
            url: `${charactersBaseUrl}/${characterId}/picture`,
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
                [process.env.NEXT_PUBLIC_TYPE_KEY as string]:
                    process.env.NEXT_PUBLIC_API_ACCESS_KEY,
            },
            data: formData,
        });

        return true;
    } catch {
        return false;
    }
};
