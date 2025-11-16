// src/theme/ThemeProvider.jsx
import React from "react";

const ThemeContext = React.createContext({
    theme: "light",
    toggle: () => {},
    setTheme: () => {},
});

export function ThemeProvider({ children }) {
    const [theme, setTheme] = React.useState(
        () => localStorage.getItem("theme") || "light"
    );

    React.useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggle = React.useCallback(
        () => setTheme((t) => (t === "dark" ? "light" : "dark")),
        []
    );


    return (
        <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return React.useContext(ThemeContext);
}
