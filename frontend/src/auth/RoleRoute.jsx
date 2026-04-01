import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

/**
 * Protège une route selon les rôles de l'utilisateur
 * @param {string[]} allowedRoles - Rôles autorisés (ex: ["ADMIN", "ALP", "PARTENAIRE"])
 * @param {React.ReactNode} children - Composant à afficher si autorisé
 */
const RoleRoute = ({ allowedRoles, children }) => {
    const { user } = useAuth();

    const getUserRoles = () => {
        if (!user?.roles) return [];
        if (Array.isArray(user.roles)) return user.roles.map(r => r.toUpperCase());
        return String(user.roles).toUpperCase().split(",").map(r => r.trim());
    };

    const userRoles = getUserRoles();
    const hasAccess = userRoles.some(role => allowedRoles.includes(role));

    if (!hasAccess) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RoleRoute;
