import { cookies } from 'next/headers';
import GeneralHeader from '@/components/common/GeneralHeader';
import LoggedHeader from '@/components/common/LoggedHeader';
import Footer from '@/components/common/Footer';
import ProfilePageContent from '@/components/profile/ProfilePageContent';
import '@/app/page.css';
import '@/app/profile/page.css';

export default function UserProfilePage({
    params,
}: {
    params: { userId: string };
}): JSX.Element {
    const recoverUserInfo = cookies().get('token') ? 1 : 0;

    if (recoverUserInfo === 1) {
        return (
            <>
                <section className="main-logged-page">
                    <LoggedHeader />
                    <main className="profile-page profile-page--logged">
                        <section className="profile-inside-container">
                            <ProfilePageContent userId={params.userId} />
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
                <main className="profile-page profile-page--guest">
                    <section className="profile-inside-container">
                        <ProfilePageContent userId={params.userId} />
                    </section>
                </main>
                <Footer />
            </section>
        </>
    );
}
