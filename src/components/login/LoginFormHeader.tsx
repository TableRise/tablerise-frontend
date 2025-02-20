import Link from 'next/link';
import './styles/LoginFormHeader.css';

export default function LoginFormHeader(): JSX.Element {
    return (
        <div className="login-form-header">
            <h1 className="font-L-semibold text-color-primary/default_900">Entrar</h1>
            <div className="login-form-header-register">
                <span className="font-XS-regular text-color-greyScale/950">
                    Não possui uma conta?
                </span>
                <Link className="font-XS-regular" href="/register">
                    Criar conta !
                </Link>
            </div>
        </div>
    );
}
