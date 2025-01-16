import { createContext } from 'react';

interface RecoverPasswordContext {
    verify: (email: string) => Promise<void>;
    userVerify: { email: string; id: string; secretQuestion: string };
    setCode: (code: string) => void;
    updatePassword: (newPassword: string) => void;
    sendSecretQuestion: (answer: string) => void;
    twoFactor: (code: string) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

const RecoverPasswordContext = createContext({} as RecoverPasswordContext);

export default RecoverPasswordContext;
