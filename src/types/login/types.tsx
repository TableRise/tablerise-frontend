import { Dispatch, SetStateAction } from "react";

export type input = {
    type: string,
    name: string,
    placeholder: string,
    onChange: Dispatch<SetStateAction<string>>,
    id: string,
    maxLength: number,
}
