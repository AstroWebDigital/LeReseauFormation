// tailwind.config.cjs
const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
            }
        }
    },
    darkMode: "class",
    plugins: [
        heroui({
            themes: {
                light: {
                    colors: {
                        primary: {
                            DEFAULT: "#C89A2B",
                            foreground: "#0E1A23"
                        },
                        background: "#f5f5f5",
                        foreground: "#0E1A23"
                    }
                },
                dark: {
                    colors: {
                        primary: {
                            DEFAULT: "#C89A2B",
                            foreground: "#0E1A23"
                        },
                        background: "#0E1A23",
                        foreground: "#f5f5f5"
                    }
                }
            }
        })
    ]
};
