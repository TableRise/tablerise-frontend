import {
    centerCrop,
    makeAspectCrop,
    type PercentCrop,
    type PixelCrop,
} from 'react-image-crop';

export type ImageUploadIntent =
    | 'profile-avatar'
    | 'character-portrait'
    | 'campaign-cover'
    | 'campaign-map'
    | 'match-highlight-image';

export interface ImageCropConfig {
    aspect?: number;
    title: string;
    description: string;
    defaultCropWidthPercent: number;
}

export const IMAGE_CROP_CONFIG: Record<ImageUploadIntent, ImageCropConfig> = {
    'profile-avatar': {
        aspect: 1,
        title: 'Recortar foto de perfil',
        description: 'Ajuste a imagem antes de enviar ou use a original sem recorte.',
        defaultCropWidthPercent: 90,
    },
    'character-portrait': {
        aspect: 1,
        title: 'Recortar retrato do personagem',
        description: 'Ajuste a imagem antes de enviar ou use a original sem recorte.',
        defaultCropWidthPercent: 90,
    },
    'campaign-cover': {
        title: 'Recortar capa da campanha',
        description: 'Recorte a capa se desejar ou mantenha a imagem original.',
        defaultCropWidthPercent: 90,
    },
    'campaign-map': {
        title: 'Recortar mapa',
        description: 'Recorte o mapa se desejar ou mantenha a imagem original.',
        defaultCropWidthPercent: 90,
    },
    'match-highlight-image': {
        title: 'Recortar imagem em destaque',
        description:
            'Recorte a imagem em destaque se desejar ou mantenha a imagem original.',
        defaultCropWidthPercent: 90,
    },
};

export function buildInitialCrop(
    intent: ImageUploadIntent,
    mediaWidth: number,
    mediaHeight: number
): PercentCrop | undefined {
    const config = IMAGE_CROP_CONFIG[intent];

    if (!config.aspect) return undefined;

    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: config.defaultCropWidthPercent,
            },
            config.aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

export async function createCroppedImageFile(
    image: HTMLImageElement,
    crop: PixelCrop,
    originalFile: File
): Promise<File> {
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const canvas = document.createElement('canvas');

    canvas.width = Math.max(1, Math.round(crop.width * scaleX));
    canvas.height = Math.max(1, Math.round(crop.height * scaleY));

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Nao foi possivel preparar o recorte da imagem.');
    }

    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
    );

    const mimeType = originalFile.type || 'image/png';
    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, mimeType, 0.92);
    });

    if (!blob) {
        throw new Error('Nao foi possivel gerar a imagem recortada.');
    }

    return new File([blob], originalFile.name, {
        type: blob.type || mimeType,
        lastModified: Date.now(),
    });
}

export function percentCropToPixelCrop(
    crop: PercentCrop,
    mediaWidth: number,
    mediaHeight: number
): PixelCrop {
    return {
        unit: 'px',
        x: Math.round(((crop.x ?? 0) / 100) * mediaWidth),
        y: Math.round(((crop.y ?? 0) / 100) * mediaHeight),
        width: Math.round((crop.width / 100) * mediaWidth),
        height: Math.round((crop.height / 100) * mediaHeight),
    };
}
