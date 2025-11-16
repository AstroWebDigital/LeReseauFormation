import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { useAuth } from "../context/AuthContext";

export default function Logout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        logout();
        navigate("/login");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <Spinner label="Déconnexion..." />
        </div>
    );
}
