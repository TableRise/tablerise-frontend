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
    errorMessageClass = 'generic-input-error-message font-XXS-regular text-color-support/alert',
    errorToggles = {
        hasErrors: false,
        errorList: {},
        showErrorInputClass: false,
    },
}: any): JSX.Element {
    const { errorList, hasErrors, showErrorInputClass } = errorToggles;
    const showError = hasErrors && errorList[name];

    return (
        <label className="generic-form-input">
            <span className={labelClass}>{title}</span>
            <div>
                <input
                    className={`${
                        showErrorInputClass ? 'input-error-light' : inputStyle
                    } ${classProps}`}
                    name={name}
                    id={id}
                    onChange={(event) => setter(event)}
                    value={value}
                    type={type}
                    placeholder={placeholder}
                    disabled={disabled}
                />
                {toggleVisibilityButton && <ShowInfoEyeButton />}
            </div>
            {showError && (
                <span className={`${errorMessageClass}`}>{errorList[name][0]}</span>
            )}
        </label>
    );
}
