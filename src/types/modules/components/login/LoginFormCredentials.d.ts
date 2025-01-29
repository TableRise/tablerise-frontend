export interface FormErrorsContract {
    errorList: Record<string, string[]>;
    hasErrors: boolean;
    showErrorInputClass: boolean;
}
