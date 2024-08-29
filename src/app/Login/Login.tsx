import LoginForm from '@/components/login/LoginForm';
import SocialLogin from '@/components/login/SocialLogin';

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
    );
}
