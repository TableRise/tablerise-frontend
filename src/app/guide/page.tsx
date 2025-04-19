import CheckeredBackground from '@/components/common/CheckeredBackground';
import GuideForm from '@/components/guide/GuideForm';
import './styles/page.css';

export default function Login(): JSX.Element {
    return (
        <section className="login-page">
            <CheckeredBackground />
            <GuideForm />
        </section>
    );
}
