import SideImage from '@/components/authentication/SideImage';
import LoginForm from '@/components/login/LoginForm';
import SocialLogin from '@/components/login/SocialLogin';
import Link from 'next/link';

export default function Login() {
    return (
        <section>
            <div id="form-title">
                <h2>Entrar</h2>
                <h3>
                    Não possui uma conta? <Link href={'/register'}>Criar conta!</Link>
                </h3>
            </div>
            <SideImage />
            <LoginForm />
            <div>
                <hr />
                <span>ou continue com</span>
                <SocialLogin />
            </div>
        </section>
    );
}
