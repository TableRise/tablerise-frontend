interface Window {
    emailjs?: {
        init: (publicKey: string) => void;
        sendForm: (
            serviceId: string,
            templateId: string,
            form: HTMLFormElement
        ) => Promise<unknown>;
    };
}
