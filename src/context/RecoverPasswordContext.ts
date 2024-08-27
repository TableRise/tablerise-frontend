import { createContext } from 'react';

interface RecoverPasswordContext {
    verify: (email: string) => Promise<void>,
    userVerify: {
        email: string,
        code: string,
    },
    setCode: (code: string) => void,
    updatePassword: (newPassword: string) => void,
}

const RecoverPasswordContext = createContext({} as RecoverPasswordContext);

export default RecoverPasswordContext;
