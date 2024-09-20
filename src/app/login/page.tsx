import SideImage from '@/components/authentication/SideImage';
import LoginForm from '@/components/login/LoginForm';
import SocialLogin from '@/components/login/SocialLogin';
import Link from 'next/link';

export default function Login() {
    return (
        <section className="flex flex-row-reverse justify-between align-center">
            <div>
                <SideImage />
            </div>
            <div className="flex flex-col w-2/5 z-10 h-screen absolute justify-center items-center bg-white rounded-l-lg text-left">
                <div className="text-left w-5/6">
                    <h2 className="text-left">Entrar</h2>
                    <h3>
                        Não possui uma conta?{' '}
                        <Link className="underline" href={'/register'}>
                            Criar conta!
                        </Link>
                    </h3>
                </div>
                <LoginForm />
                <div className="z-10">
                    <hr />
                    <span>ou continue com</span>
                    <SocialLogin />
                </div>
            </div>
        </section>
    );
}
