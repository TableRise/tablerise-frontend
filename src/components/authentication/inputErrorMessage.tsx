import '@/components/authentication/styles/inputErrorMessage.css';
import { InputErrorMessageProps } from '@/types/modules/components/authentication/inputErrorMessage';

export default function InputErrorMessage({
    errorMessage,
}: InputErrorMessageProps): JSX.Element {
    return <p className="error-message font-XXS-bold">{errorMessage}</p>;
}
