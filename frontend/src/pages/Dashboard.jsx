// src/pages/Dashboard.jsx
import React from "react";
import DashboardWelcomeCard from "@/components/dashboard/DashboardWelcomeCard";
import DashboardKpiRow from "@/components/dashboard/DashboardKpiRow";
import DashboardRevenueSection from "@/components/dashboard/DashboardRevenueSection";
import DashboardVehiclesSection from "@/components/dashboard/DashboardVehiclesSection";
import DashboardReservationsSection from "@/components/dashboard/DashboardReservationsSection";

const Dashboard = () => {
    return (
        <div className="min-h-full px-6 py-6 lg:px-10 lg:py-8 bg-gradient-to-b from-[#070b24] via-[#05071a] to-[#05071a]">
            <div className="space-y-6 lg:space-y-8">
                <DashboardWelcomeCard />

                <DashboardKpiRow />

                <DashboardRevenueSection />

                <DashboardVehiclesSection />

                <DashboardReservationsSection />
            </div>
        </div>
    );
};

export default Dashboard;
