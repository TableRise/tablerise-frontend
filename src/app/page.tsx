import React from 'react';
import FAQ from '@/components/home/FAQ';
import Header from '@/components/Header';

export default function Home() {
    return (
        <section>
            <h1>TableRise</h1>
            <input placeholder="Teste" className="input-active-light font-XS-regular" />
            <Header />
            <FAQ />
        </section>
    );
}
