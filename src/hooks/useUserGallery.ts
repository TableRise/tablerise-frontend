'use client';

import { useCallback, useEffect, useState } from 'react';
import { getUserGallery } from '@/server/users/collections';
import type { ImageObject } from '@/types/shared/general';

export function useUserGallery(userId?: string) {
    const [galleryImages, setGalleryImages] = useState<ImageObject[]>([]);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [galleryError, setGalleryError] = useState('');

    const refreshGallery = useCallback(async (): Promise<ImageObject[]> => {
        if (!userId) {
            setGalleryImages([]);
            setGalleryError('');
            return [];
        }

        setLoadingGallery(true);

        try {
            const images = await getUserGallery(userId);
            setGalleryImages(images);
            setGalleryError('');
            return images;
        } catch (error: Error | any) {
            setGalleryImages([]);
            setGalleryError(error?.message ?? 'Nao foi possivel carregar a galeria');
            return [];
        } finally {
            setLoadingGallery(false);
        }
    }, [userId]);

    useEffect(() => {
        void refreshGallery();
    }, [refreshGallery]);

    return {
        galleryImages,
        loadingGallery,
        galleryError,
        refreshGallery,
    };
}
