export default function Input({props}: any) {
    
    return (
        <label htmlFor={props.type}>{props.name}
            <input
                id={props.id}
                type={props.type}
                maxLength={props.maxLength}
                placeholder={props.placeholder}
                onChange={({ target }) => props.setEmail(target.value)}
            />
            {/* validar */}
        </label>
    )
}