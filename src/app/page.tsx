import React from 'react';
import FAQ from './components/FAQ';

export default function Home() {
    return (
        <main className='w-full px-16 bg-[#141414]'>
            <h1>TableRise</h1>
            <input placeholder="Teste" className="input-active-light font-XS-regular" />
            <FAQ />
        </main>
    );
}
