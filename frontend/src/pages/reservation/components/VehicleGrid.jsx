import { TruckIcon } from "@heroicons/react/24/outline";
import { VehicleCard } from "./VehicleCard";

export function VehicleGrid({ vehicles, onBook, isDark }) {
    const isLight = !isDark;

    if (vehicles.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center py-24 gap-3
                ${isLight ? "text-slate-400" : "text-white/30"}`}>
                <TruckIcon className="h-14 w-14" />
                <p className="text-lg font-medium">Aucun véhicule disponible</p>
                <p className="text-sm">Revenez plus tard ou modifiez votre recherche.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} onBook={onBook} isDark={isDark} isOwned={v.isOwned} />
            ))}
        </div>
    );
}
