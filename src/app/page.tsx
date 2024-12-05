import React from 'react';
import FAQ from '@/components/home/FAQ';
import Header from '@/components/Header';
import Banner from '@/components/home/Banner';
import Promo from '@/components/home/Promo';
import Features from '@/components/home/Features';
import SecondPromo from '@/components/home/SecondPromo';
import '@/app/page.css';

export default function Home(): JSX.Element {
    return (
        <main>
            <section className="header-home">
                <Header />
                <Banner />
            </section>
            <section className="content-home">
                <Promo />
                <Features />
                <SecondPromo />
                <FAQ />
            </section>
        </main>
    );
}
