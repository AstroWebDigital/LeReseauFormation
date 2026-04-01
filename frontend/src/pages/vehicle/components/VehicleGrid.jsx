import React from "react";
import { useTheme } from "@/theme/ThemeProvider";
import { VehicleCard } from "./VehicleCard";

export const VehicleGrid = ({ vehicles, onEdit, onDelete, statusColorMap, canManage = true }) => {
    const { isDark } = useTheme();

    if (vehicles.length === 0) {
        return (
            <div className={`text-center py-20 rounded-xl border border-dashed ${
                isDark
                    ? "bg-slate-900/50 border-slate-800 text-slate-500"
                    : "bg-slate-50 border-slate-300 text-slate-400"
            }`}>
                <p>Aucun véhicule dans votre flotte.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
                <VehicleCard
                    key={v.id}
                    vehicle={v}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    statusColorMap={statusColorMap}
                    canManage={canManage}
                />
            ))}
        </div>
    );
};