'use client';
import React, { useContext, useState } from 'react';
import GeneralHeader from '@/components/common/GeneralHeader';
import FAQ from '@/components/home/FAQ';
import Banner from '@/components/home/Banner';
import Promo from '@/components/home/Promo';
import Features from '@/components/home/Features';
import SecondPromo from '@/components/home/SecondPromo';
import Footer from '@/components/common/Footer';
import TableriseContext from '@/context/TableriseContext';
import LoggedHeader from '@/components/common/LoggedHeader';
import '@/app/page.css';
import UserMasterCampaigns from '@/components/home/UserMasterCampaigns';
import UserPlayerCampaigns from '@/components/home/UserPlayerCampaigns';
import JoinCampaignModal from '@/components/home/JoinCampaignModal';

export default function Home(): JSX.Element {
    const { userLoggedToggle, userCampaigns } = useContext(TableriseContext);
    const [joinModalOpen, setJoinModalOpen] = useState(false);

    const userNotLoggedPage = (
        <>
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
        </>
    );

    const userLoggedPage = (
        <>
            <section className="main-logged-page">
                <LoggedHeader />
                <h2 className="font-XL-bold">Campanhas</h2>
                <UserMasterCampaigns campaigns={userCampaigns.master} />
                <UserPlayerCampaigns
                    campaigns={userCampaigns.player}
                    onJoinClick={() => setJoinModalOpen(true)}
                />
                {joinModalOpen && (
                    <JoinCampaignModal onClose={() => setJoinModalOpen(false)} />
                )}
            </section>
            <Footer />
        </>
    );

    return <main>{userLoggedToggle === 0 ? userNotLoggedPage : userLoggedPage}</main>;
}
