import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const RootLayout = ({ children }) => {
    return (
        <div className="app-container">
            <Navbar />
            <main className="app-main">{children}</main>
            <Footer />
        </div>
    );
};

export default RootLayout;
