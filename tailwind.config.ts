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
                'color-primary/800': '#0542C8',
                'color-primary/default_900': '#0A358A',
                'color-primary/950': '#0C255F',
                'color-greyScale/50': '#FFFFFF',
                'color-greyScale/100': '#EFEFEF',
                'color-greyScale/300': '#BDBDBD',
                'color-greyScale/500': '#7C7C7C',
                'color-greyScale/700': '#525252',
                'color-greyScale/800': '#464646',
                'color-greyScale/900': '#3D3D3D',
                'color-greyScale/950': '#292929',
                'color-suport/success': '#12AD00',
                'color-suport/alert': '#F42C04',
            },
        },
    },
    plugins: [],
};
export default config;
