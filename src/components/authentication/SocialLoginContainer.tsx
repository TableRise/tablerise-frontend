'use client';
import React, { useEffect, useState, Suspense  } from 'react';
import SocialLoginButton from './SocialLoginButton';
import '@/components/authentication/styles/SocialLoginContainer.css';
import { useSearchParams } from 'next/navigation';
import errorHandler from '../../utils/errorHandler';
import InputErrorMessage from './inputErrorMessage';

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
        <Suspense >
        <div className="social-container">
            <div className="buttons-container">
                <SocialLoginButton title="Discord" socialType={'discord'} />
                <SocialLoginButton title="Google" socialType={'google'} />
            </div>
            {hasError && <InputErrorMessage errorMessage={hasError} />}
        </div>
        </Suspense>
    );
}
