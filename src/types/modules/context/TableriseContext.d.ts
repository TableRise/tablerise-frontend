export interface TableriseContextContract {
    loading: boolean;
    newPassVisible: boolean;
    darkModeOn: boolean;
    userLoggedToggle: number;
    setLoading: (boolean: boolean) => void;
    setNewPassVisible: (boolean: boolean) => void;
    setDarkModeOn: (boolean: boolean) => void;
}
