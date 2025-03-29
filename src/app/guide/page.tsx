import React from 'react';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import './styles/page.css';
import GuideMenuBanner from '@/components/guide/GuideMenuBanner';

export default function Home(): JSX.Element {
    return (
        <main>
            <section className="header-home">
                <Header />
            </section>
            <section className="content-home">
                <GuideMenuBanner />
                <Footer />
            </section>
        </main>
    );
}
