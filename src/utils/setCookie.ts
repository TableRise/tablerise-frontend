'use server';
import { cookies } from 'next/headers';

export async function setToken(token: string): Promise<string | any> {
    cookies().set('token', token);
}
