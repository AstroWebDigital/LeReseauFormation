// src/theme/ThemeProvider.jsx
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        if (typeof window === "undefined") return "dark";
        return window.localStorage.getItem("app-theme") || "dark";
    });

    // Applique la classe light / dark sur <html>
    useEffect(() => {
        if (typeof document === "undefined") return;

        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);

        window.localStorage.setItem("app-theme", theme);
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            isDark: theme === "dark",
            toggle: () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
            setTheme,
        }),
        [theme]
    );

    return (
        <ThemeContext.Provider value={value}>
            {/* Fond global basé sur le thème HeroUI */}
            <div className="min-h-screen bg-background text-foreground transition-colors">
                {children}
            </div>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return ctx;
};
