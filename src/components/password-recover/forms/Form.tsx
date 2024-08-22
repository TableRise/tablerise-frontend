import { ButtonHTMLAttributes, forwardRef, HTMLProps, InputHTMLAttributes, LabelHTMLAttributes } from 'react';
import './styles/Form.css';
import { FieldError } from 'react-hook-form';

function Title(props: HTMLProps<HTMLHeadingElement>) {

    return (
        <h1
            className='font-L-semibold text-color-primary/default_900 pb-1'
            {...props}
        />
    )
}

function Description(props: HTMLProps<HTMLHeadingElement>) {

    return (
        <p
            className='font-XS-regular text-color-greyScale/950 pb-6'
            {...props}
        />
    )
}

function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {

    return (
        <label
            className='font-S-bold text-color-greyScale/950'
            {...props}
        />
    )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error: FieldError | undefined;
}
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { error, ...rest} = props;

    return (
        <input
            ref={ref}
            className={`form-input input-default-light font-XS-regular focus:input-active-light focus:text-black
                ${error ? 'mb-0 input-error-light focus:input-error-light text-black': 'mb-6'}
            `}
            {...rest}
        />
    )
})

function ButtonSubmit(props: ButtonHTMLAttributes<HTMLButtonElement>) {

    return (
        <button
            className='font-S-bold form-button-submit
                button-L-fill'
            {...props}
        />
    )
}

function ButtonCancel(props: ButtonHTMLAttributes<HTMLButtonElement>) {

    return (
        <button
            className='form-button-cancel font-S-bold
                button-L-ghost'
            {...props}
        />
    )
}

export default {
    Title,
    Description,
    Label,
    Input,
    ButtonSubmit,
    ButtonCancel,
}