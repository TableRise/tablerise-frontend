import ShowInfoEyeButton from '../ShowInfoEyeButton';
import './styles/Input.css';

export default function Input({
    title,
    labelClass = 'font-S-bold text-color-greyScale/950',
    inputStyle,
    classProps,
    value,
    setter,
    name,
    id = name,
    type,
    placeholder,
    disabled = false,
    toggleVisibilityButton = false,
    errorMessage,
    errorMessageClass = 'generic-input-error-message font-XXS-regular text-color-support/alert',
}: any): JSX.Element {
    return (
        <label className="generic-form-input">
            <span className={labelClass}>{title}</span>
            <div>
                <input
                    className={`${
                        errorMessage ? 'input-error-light' : inputStyle
                    } ${classProps}`}
                    name={name}
                    id={id}
                    {...setter(name)}
                    value={value}
                    type={type}
                    placeholder={placeholder}
                    disabled={disabled}
                />
                {toggleVisibilityButton && <ShowInfoEyeButton />}
            </div>
            {errorMessage && (
                <span className={`${errorMessageClass}`}>{errorMessage.message}</span>
            )}
        </label>
    );
}
