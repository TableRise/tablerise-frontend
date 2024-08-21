import LoginForm from '@/components/login/LoginForm';
import SocialLogin from '@/components/login/SocialLogin';
import Header from '@/components/Header';

export default function Login() {
    return (
        <div>
            <LoginForm />
            <div>
                <hr />
                <span>ou continue com</span>
                <SocialLogin />
            </div>
        </div>
    )
}