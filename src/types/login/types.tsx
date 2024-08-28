import { Dispatch, SetStateAction } from 'react';

export type input = {
    type: string;
    name: string;
    placeholder: string;
    onChange: Dispatch<SetStateAction<string>>;
    id: string;
};

export type userData = {
    userEmail: string;
    userPassword: string;
};
