'use client';
import { useContext } from 'react';
import VisibilityOff from '@assets/icons/sys/visibility-off.svg';
import Visibility from '@assets/icons/sys/visibility.svg';
import TableriseContext from '@/context/TableriseContext';

export default function ShowInfoEyeButton(): JSX.Element {
    console.log(typeof window);
    const { newPassVisible, setNewPassVisible } = useContext(TableriseContext);

    return (
        <button
            type="button"
            onClick={() => setNewPassVisible(!newPassVisible)}
            className="show-info-eye w-6 h-6 text-color-greyScale/500"
        >
            {newPassVisible ? <VisibilityOff /> : <Visibility />}
        </button>
    );
}
