/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'rich-black': '#050505',
                'rich-black-light': '#0A0A0A',
                'luxury-red': '#DC2626',
                'muted-silver': '#A1A1AA',
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
            },
            animation: {
                'glow-pulse': 'glow-pulse 3s infinite',
            },
            keyframes: {
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 10px rgba(220, 38, 38, 0.2)' },
                    '50%': { boxShadow: '0 0 25px rgba(220, 38, 38, 0.5)' },
                }
            }
        },
    },
    plugins: [],
}
