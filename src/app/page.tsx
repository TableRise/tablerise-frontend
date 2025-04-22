'use client';
import React, { useContext } from 'react';
import FAQ from '@/components/home/FAQ';
import Banner from '@/components/home/Banner';
import Promo from '@/components/home/Promo';
import Features from '@/components/home/Features';
import SecondPromo from '@/components/home/SecondPromo';
import Footer from '@/components/home/Footer';
import TableriseContext from '@/context/TableriseContext';
import GeneralHeader from '@/components/common/GeneralHeader';
import LoggedHeader from '@/components/common/LoggedHeader';
import '@/app/page.css';

export default function Home(): JSX.Element {
    const { userLoggedToggle } = useContext(TableriseContext);

    const toggleHeader = () => {
        switch (userLoggedToggle) {
            case 1:
                return <LoggedHeader />;
            case 0:
                return <GeneralHeader />;
            default:
                return <GeneralHeader />;
        }
    };

    return (
        <main>
            <section className="header-home">
                {toggleHeader()}
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
