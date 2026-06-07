import type { ImageObject } from '@/types/shared/general';

export type UploadImageValue = File | ImageObject;
type SerializedImageObject = Omit<ImageObject, 'request'>;

export function isGalleryImageObject(value: UploadImageValue): value is ImageObject {
    return !(typeof File !== 'undefined' && value instanceof File);
}

function sanitizeGalleryImageObject(value: ImageObject): SerializedImageObject {
    const { request, ...rest } = value as ImageObject & { request?: unknown };

    void request;

    return rest;
}

export function appendUploadImageValue(
    formData: FormData,
    fieldName: string,
    value: UploadImageValue
): void {
    if (!isGalleryImageObject(value)) {
        formData.append(fieldName, value);
        return;
    }

    formData.append('imageObject', JSON.stringify(sanitizeGalleryImageObject(value)));
}

export function appendMultiUploadImageValues(
    formData: FormData,
    fieldName: string,
    values: UploadImageValue[]
): void {
    const imageObjects: SerializedImageObject[] = [];

    values.forEach((value) => {
        if (isGalleryImageObject(value)) {
            imageObjects.push(sanitizeGalleryImageObject(value));
            return;
        }

        formData.append(fieldName, value);
    });

    if (imageObjects.length > 0) {
        formData.append('imageObject', JSON.stringify(imageObjects));
    }
}

export function appendCampaignCreateImageValues(
    formData: FormData,
    options: {
        coverImage?: UploadImageValue | null;
        mapImages: UploadImageValue[];
    }
): void {
    const imageObjectPayload: {
        cover?: SerializedImageObject;
        mapImages?: SerializedImageObject[];
    } = {};

    if (options.coverImage) {
        if (isGalleryImageObject(options.coverImage)) {
            imageObjectPayload.cover = sanitizeGalleryImageObject(options.coverImage);
        } else {
            formData.append('cover', options.coverImage);
        }
    }

    const mapImageObjects: SerializedImageObject[] = [];

    options.mapImages.forEach((mapImage) => {
        if (isGalleryImageObject(mapImage)) {
            mapImageObjects.push(sanitizeGalleryImageObject(mapImage));
            return;
        }

        formData.append('mapImages', mapImage);
    });

    if (mapImageObjects.length > 0) {
        imageObjectPayload.mapImages = mapImageObjects;
    }

    if (imageObjectPayload.cover || imageObjectPayload.mapImages) {
        formData.append('imageObject', JSON.stringify(imageObjectPayload));
    }
}

export function getUploadImagePreview(value: UploadImageValue): string {
    if (!isGalleryImageObject(value)) {
        return URL.createObjectURL(value);
    }

    return value.link ?? '';
}
