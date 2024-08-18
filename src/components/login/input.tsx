import { useRef, useState } from "react";

export default function Input({ props }: any) {
    //FAZER USANDO CONTEXT
    const [userEmail, setEmail] = useState('');
    const [userPassword, setPassword] = useState('');

    const MAX_LENGTH_EMAIL = 30;
    const MAX_LENGTH_PASS = 50;
    const MIN_LENGTH_PASS = 6;

    function validateInput(value: string, type: string) {
        if(type === 'email') { 
            const validHas: RegExp =  /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
            validHas.test(value) ? console.log("ok") : console.log("email invalido");
            
        }
        else if (value.length < MIN_LENGTH_PASS) {
            console.log(`campo vermelho enquanto menos de 6 caracteres` );
        }
    }

    //pegando email e senha
    function handleInput(value: string, type: string) {        
        validateInput(value, props.type);
        if(type === 'email') {        
            setEmail(value);
        }
        setPassword(value);
    }

    return (
        <div>
            <label htmlFor={props.type}>{props.name}
                <input
                    id={props.id}
                    type={props.type}
                    maxLength={props.type === "email" ? MAX_LENGTH_EMAIL : MAX_LENGTH_PASS }
                    placeholder={props.placeholder}
                    onChange={({target}) => handleInput(target.value, props.type)}
                />
            </label>
        </div>
    )
}