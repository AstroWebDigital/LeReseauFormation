import React from "react";

const Footer = () => (
    <footer className="mt-10 border-t border-default-200">
        <div className="max-w-4xl mx-auto px-4 py-4 text-[11px] text-center text-default-500">
            © {new Date().getFullYear()} Le Réseau Formation — AstroWeb Digital
        </div>
    </footer>
);

export default Footer;
