import React from 'react';
import GeneralHeader from '@/components/common/GeneralHeader';
import FAQ from '@/components/home/FAQ';
import Banner from '@/components/home/Banner';
import Promo from '@/components/home/Promo';
import Features from '@/components/home/Features';
import SecondPromo from '@/components/home/SecondPromo';
import Footer from '@/components/common/Footer';
import '@/app/page.css';

export default function Home(): JSX.Element {
    return (
        <main>
            <section className="header-home">
                <GeneralHeader />
                <Banner />
            </section>
            <section className="content-home">
                <Promo />
                <Features />
                <SecondPromo />
                <FAQ />
                <Footer />
            </section>
        </main>
    );
}
