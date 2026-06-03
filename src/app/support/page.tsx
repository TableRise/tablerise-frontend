import { cookies } from 'next/headers';
import GeneralHeader from '@/components/common/GeneralHeader';
import LoggedHeader from '@/components/common/LoggedHeader';
import Footer from '@/components/common/Footer';
import SupportForm from '@/components/support/SupportForm';
import '@/app/page.css';
import '@/app/support/page.css';

export default function SupportPage(): JSX.Element {
    const recoverUserInfo = cookies().get('token') ? 1 : 0;

    const supportCard = (
        <section className="support-page-card">
            <div className="support-page-copy">
                <p className="font-S-regular text-color-greyScale/700">
                    Envie sua solicitação e retornaremos o mais rápido possível.
                </p>
            </div>

            <SupportForm />
        </section>
    );

    if (recoverUserInfo === 1) {
        return (
            <>
                <section className="main-logged-page">
                    <LoggedHeader />
                    <main className="support-page support-page--logged">
                        <section className="support-inside-container">
                            <h2 className="font-XL-bold support-page-title">Suporte</h2>
                            {supportCard}
                        </section>
                    </main>
                </section>
                <Footer />
            </>
        );
    }

    return (
        <>
            <section className="header-home">
                <GeneralHeader />
            </section>
            <section className="content-home">
                <main className="support-page support-page--guest">
                    <section className="support-inside-container">
                        <h2 className="font-XL-bold support-page-title">Suporte</h2>
                        {supportCard}
                    </section>
                </main>
                <Footer />
            </section>
        </>
    );
}
