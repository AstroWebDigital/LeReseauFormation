// frontend/src/pages/Home.jsx
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, Card, CardHeader, CardBody, CardFooter } from "@heroui/react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
            <Card className="max-w-xl w-full">
                <CardHeader className="flex flex-col items-start gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Le Réseau Formation
                    </h1>
                    <p className="text-sm text-default-500">
                        Frontend React connecté à un backend Spring Boot (JWT) et une base
                        PostgreSQL.
                    </p>
                </CardHeader>

                <CardBody className="space-y-4">
                    {!user && (
                        <>
                            <p className="text-sm text-default-600">
                                Crée un compte ou connecte-toi pour accéder à ton tableau de
                                bord.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    as={RouterLink}
                                    to="/register"
                                    color="primary"
                                    fullWidth
                                >
                                    Créer un compte
                                </Button>
                                <Button
                                    as={RouterLink}
                                    to="/login"
                                    variant="bordered"
                                    fullWidth
                                >
                                    Se connecter
                                </Button>
                            </div>
                        </>
                    )}

                    {user && (
                        <>
                            <p className="text-sm text-default-600">
                                Connecté en tant que{" "}
                                <span className="font-semibold">{user.email}</span>.
                            </p>
                            <Button
                                as={RouterLink}
                                to="/dashboard"
                                color="primary"
                                fullWidth
                            >
                                Accéder au dashboard
                            </Button>
                        </>
                    )}
                </CardBody>

                <CardFooter className="text-[11px] text-default-400">
                    PROJET TEST ARTHUR — AstroWeb Digital
                </CardFooter>
            </Card>
        </div>
    );
};

export default Home;
