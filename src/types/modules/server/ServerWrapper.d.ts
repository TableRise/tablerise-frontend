export interface WrapperPayload {
    baseUrl: string | undefined;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: any;
    params?: any;
}
