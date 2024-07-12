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
                'tr-primary-color/gradient': 'linear-gradient(129deg, #0A328A 27.44%, #0D255C 114.68%)',
                'tr-primary-color/500': '#1B8BFF',
                'tr-primary-color/800': '#0542C8',
                'tr-primary-color/900': '#0A358A',
                'tr-primary-color/950': '#0C255F',
                'tr-grey-color/50': '#FFFFFF',
                'tr-grey-color/100': '#EFEFEF',
                'tr-grey-color/300': '#BDBDBD',
                'tr-grey-color/500': '#7C7C7C',
                'tr-grey-color/700': '#525252',
                'tr-grey-color/800': '#464646',
                'tr-grey-color/900': '#3D3D3D',
                'tr-grey-color/950': '#292929',
                'tr-support-color/success': '#12AD00',
                'tr-support-color/alert': '#F42C04',
            }
        }
    },
    plugins: [],
};
export default config;
