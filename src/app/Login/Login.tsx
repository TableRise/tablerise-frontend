import Form from '@/components/login/Form';
import SocialLogin from '@/components/login/SocialLogin';
import Header from '@/components/Header';

export default function Login() {
return (
    <section>
        <Header />
        <main>
            <Form />
            <div>
                <hr />
                <span>ou continue com</span>
            </div>
            <SocialLogin />
        </main>
    </section>
)}