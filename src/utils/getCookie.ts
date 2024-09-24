'use server';
import { cookies } from 'next/headers';

export async function getToken(): Promise<string | any> {
    const token = cookies().getAll();
    if (token.length === 0) {
        console.log('VAZIo // SEM REGISTRO');
        return 'empty';
    }
    return token[0].value;
};
