'use server';

import axios from 'axios';

export interface YouTubeVideoDetail {
    id: string;
    title: string;
    thumbnailUrl: string;
}

export async function getYouTubeVideoDetails(
    videoId: string
): Promise<YouTubeVideoDetail> {
    const baseUrl = process.env.API_GOOGLE_YOUTUBE;
    const apiKey = process.env.API_GOOGLE_KEY;

    const { data } = await axios.get(`${baseUrl}/videos`, {
        params: {
            part: 'snippet',
            id: videoId,
            key: apiKey,
        },
    });

    if (!data.items || data.items.length === 0) {
        throw new Error('Vídeo não encontrado');
    }

    const snippet = data.items[0].snippet;

    return {
        id: data.items[0].id,
        title: snippet.title,
        thumbnailUrl: snippet.thumbnails?.default?.url ?? '',
    };
}
