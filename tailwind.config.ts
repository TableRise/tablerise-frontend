/* eslint-disable quotes */
import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'color-primary/500': '#1B8BFF',
                'color-primary/700': '#0052F8',
                'color-primary/800': '#0542C8',
                'color-primary/default_900': '#0A358A',
                'color-primary/950': '#0C255F',
                'color-greyScale/50': '#FFFFFF',
                'color-greyScale/100': '#EFEFEF',
                'color-greyScale/200': '#DCDCDC',
                'color-greyScale/300': '#BDBDBD',
                'color-greyScale/500': '#7C7C7C',
                'color-greyScale/700': '#525252',
                'color-greyScale/800': '#464646',
                'color-greyScale/900': '#3D3D3D',
                'color-greyScale/950': '#292929',
                'color-support/success': '#12AD00',
                'color-support/alert': '#F42C04',
            },
            backgroundImage: {
                'side-image-background': "url('/images/SideImageBackground.svg')",
            },
            content: {
                checked: "url('/icons/check.svg')",
            },
        },
    },
    plugins: [],
};
export default config;
