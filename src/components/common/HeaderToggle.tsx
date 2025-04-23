import GeneralHeader from './GeneralHeader';
import LoggedHeader from './LoggedHeader';

export default function HeaderToggle({
    userLogged,
}: {
    userLogged: number;
}): JSX.Element {
    const toggleHeader = () => {
        switch (userLogged) {
            case 1:
                return <LoggedHeader />;
            case 0:
                return <GeneralHeader />;
            default:
                return <GeneralHeader />;
        }
    };

    return <>{toggleHeader()}</>;
}
