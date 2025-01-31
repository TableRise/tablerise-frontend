export interface TableriseContextContract {
    loading: boolean;
    newPassVisible: boolean;
    darkModeOn: boolean;
    setLoading: (boolean: boolean) => void;
    setNewPassVisible: (boolean: boolean) => void;
    setDarkModeOn: (boolean: boolean) => void;
}
