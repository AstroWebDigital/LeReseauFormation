import { Card, CardHeader, CardBody, Button, Chip, Divider } from "@heroui/react";
import { Fuel, Settings2, Gauge, MapPin, Edit, Trash2 } from "lucide-react";

export const VehicleCard = ({ vehicle, onEdit, onDelete, statusColorMap }) => (
    <Card className="bg-slate-900 border-slate-800 border shadow-md">
        <CardHeader className="flex justify-between items-start px-5 pt-5 text-white">
            <div>
                <p className="text-tiny uppercase font-bold text-default-400">{vehicle.type}</p>
                <h2 className="text-xl font-bold">{vehicle.brand} {vehicle.model}</h2>
                <code className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">{vehicle.plateNumber}</code>
            </div>
            <div className="flex gap-1">
                <Button isIconOnly size="sm" variant="light" className="text-default-400" onPress={() => onEdit(vehicle)}>
                    <Edit size={14} />
                </Button>
                <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onDelete(vehicle.id)}>
                    <Trash2 size={14} />
                </Button>
            </div>
        </CardHeader>
        <CardBody className="px-5 py-4 text-white">
            <div className="grid grid-cols-2 gap-4 mb-4 text-default-400">
                <div className="flex items-center gap-2"><Fuel size={16} /> {vehicle.fuel}</div>
                <div className="flex items-center gap-2"><Settings2 size={16} /> {vehicle.transmission}</div>
                <div className="flex items-center gap-2"><Gauge size={16} /> {vehicle.mileage} km</div>
                <div className="flex items-center gap-2 truncate"><MapPin size={16} /> {vehicle.defaultParkingLocation || "N/A"}</div>
            </div>
            <Divider className="my-3 bg-slate-800" />
            <div className="flex justify-between items-center">
                <p className="text-2xl font-bold">{vehicle.baseDailyPrice}€ <span className="text-tiny text-default-500">/ jour</span></p>
                <Chip color={statusColorMap[vehicle.status] || "default"} variant="flat" size="sm">{vehicle.status}</Chip>
            </div>
        </CardBody>
    </Card>
);