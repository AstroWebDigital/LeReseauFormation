import React from "react";
import { VehicleCard } from "./VehicleCard";

export const VehicleGrid = ({ vehicles, onEdit, onDelete, statusColorMap }) => {
    if (vehicles.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                <p className="text-slate-500">Aucun véhicule dans votre flotte.</p>
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
                />
            ))}
        </div>
    );
};