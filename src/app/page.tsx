import Form from './components/Form';
import SocialLogin from './components/SocialLogin';

export default function Login() {

    return (
        <main>
            <Form />
            <div>
                <hr />
                <span>ou continue com</span>
            </div>
            <SocialLogin />
        </main>
    );
}
