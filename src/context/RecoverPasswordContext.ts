import { createContext } from 'react';

interface RecoverPasswordContext {
    verify: (email: string) => Promise<void>,
    userVerify: {
        email: string,
        code: string,
    }
}

const RecoverPasswordContext = createContext({} as RecoverPasswordContext);

export default RecoverPasswordContext;
