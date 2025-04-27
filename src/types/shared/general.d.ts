export interface ImageObject {
    id: string;
    title: string;
    link: string;
    uploadDate: string;
    thumbSizeUrl: string;
    mediumSizeUrl: string;
    deleteUrl: string;
    request: {
        success: boolean;
        status: number;
    };
    width: number;
    height: number;
}
