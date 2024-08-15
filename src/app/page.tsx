import Form from './components/Form';
import SocialLogin from './components/SocialLogin';
import Header from '@/components/Header';

export default function Home() {
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
    );
}
