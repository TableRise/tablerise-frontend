'use client';

import { useContext } from 'react';
import Image from 'next/image';
import TableriseContext from '@/context/TableriseContext';
import LightModeLogo from '@assets/icons/light-dark-mode/light-mode-sun.svg?url';
import DarkModeLogo from '@assets/icons/light-dark-mode/dark-mode-moon.svg?url';
import '@/components/common/styles/HeaderThemeButton.css';

export default function HeaderThemeButton(): JSX.Element {
    const { themeMode, toggleThemeMode } = useContext(TableriseContext);

    return (
        <div className="theme-toggle">
            <input
                type="checkbox"
                id="darkmode-toggle"
                checked={themeMode === 'dark'}
                onChange={toggleThemeMode}
            />
            <label htmlFor="darkmode-toggle" className="label-darkmode-toggle">
                <Image
                    src={LightModeLogo}
                    alt="Light Mode Logo"
                    className="light-mode-logo"
                />
                <Image
                    src={DarkModeLogo}
                    alt="Dark Mode Logo"
                    className="dark-mode-logo"
                />
            </label>
        </div>
    );
}
