import type { DatabaseImageObject } from '@/types/shared/entities';

export interface ImageObject extends DatabaseImageObject {
    width?: number;
    height?: number;
}
