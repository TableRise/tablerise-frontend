'use client';
import React, { useEffect, useState } from 'react';
import SocialLoginButton from './SocialLoginButton';
import { useSearchParams } from 'next/navigation';
import errorHandler from '../../utils/errorHandler';
import InputErrorMessage from '../authentication/inputErrorMessage';
import './styles/SocialLoginContainer.css';

export default function SocialLoginContainer(): JSX.Element {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const [hasError, setHasError] = useState<string | undefined>();

    useEffect(() => {
        if (error) {
            const errorList = errorHandler({ errorMessage: error });
            setHasError(errorList[0].message);
        }
    }, []);

    return (
        <div className="social-container">
            <div className="buttons-container">
                <SocialLoginButton title="Discord" socialType={'discord'} />
                <SocialLoginButton title="Google" socialType={'google'} />
            </div>
            {hasError && <InputErrorMessage errorMessage={hasError} />}
        </div>
    );
}
