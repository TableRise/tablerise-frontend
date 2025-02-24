import {
    ButtonHTMLAttributes,
    forwardRef,
    HTMLAttributes,
    HTMLProps,
    InputHTMLAttributes,
    LabelHTMLAttributes,
} from 'react';
import { FieldError } from 'react-hook-form';
import './styles/Form.css';

function Title(props: HTMLProps<HTMLHeadingElement>) {
    return (
        <h1 className="font-L-semibold text-color-primary/default_900 pb-1" {...props} />
    );
}

function Description(props: HTMLProps<HTMLHeadingElement>) {
    return <p className="font-XS-regular text-color-greyScale/950 pb-6" {...props} />;
}

function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label
            className="flex flex-col font-S-bold text-color-greyScale/950 gap-2"
            {...props}
        />
    );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error: FieldError | undefined;
}
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
    const { error, ...rest } = props;

    return (
        <input
            ref={ref}
            className={`form-input input-default-light font-XS-regular focus:input-active-light focus:text-black text-black
                ${
                    error
                        ? 'mb-0 input-error-light focus:input-error-light text-black'
                        : 'mb-6'
                }
            `}
            {...rest}
        />
    );
});

function Span(props: HTMLAttributes<HTMLSpanElement>) {
    return <span className="form-span text-red-500 font-XXS-regular" {...props} />;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
}

function ButtonSubmit(props: ButtonProps) {
    return (
        <button
            type="submit"
            className={`font-S-bold form-button-submit bg-color-primary/default_900
                button-L-fill ${props.loading ? 'opacity-50' : 'opacity-100'}`}
            disabled={props.loading}
            {...props}
        />
    );
}

function ButtonCancel(props: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            className="font-S-bold form-button-cancel
                button-L-ghost"
            {...props}
        />
    );
}

const Form = {
    Title,
    Description,
    Label,
    Input,
    Span,
    ButtonSubmit,
    ButtonCancel,
};

export default Form;
