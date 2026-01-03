/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f7ff',
                    100: '#e0effe',
                    200: '#bae0fd',
                    300: '#7cc8fb',
                    400: '#38acf8',
                    500: '#0e91e9',
                    600: '#0274c7',
                    700: '#035ca1',
                    800: '#074e84',
                    900: '#0c426e',
                    950: '#082a4a',
                },
                accent: {
                    50: '#fdf4ff',
                    100: '#fae8ff',
                    200: '#f5d0fe',
                    300: '#f0abfc',
                    400: '#e879f9',
                    500: '#d946ef',
                    600: '#c026d3',
                    700: '#a21caf',
                    800: '#86198f',
                    900: '#701a75',
                    950: '#4a044e',
                },
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444',
            },
            boxShadow: {
                'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
                'premium-hover': '0 20px 40px -5px rgba(0, 0, 0, 0.08), 0 12px 16px -8px rgba(0, 0, 0, 0.08)',
            },
            borderRadius: {
                '2xl': '1.25rem',
                '3xl': '2rem',
            }
        },
    },
    plugins: [],
}
