// src/pages/Login.jsx
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
    Card,
    CardBody,
    Button,
    Checkbox,
    Divider,
} from "@heroui/react";
import { AuthAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/FormInput";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const { data } = await AuthAPI.login({
                email: form.email,
                password: form.password,
                remember,
            });

            if (!data?.token) {
                setError("Identifiants invalides");
                return;
            }

            login(data.token, data.user);
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError("Identifiants invalides ou erreur serveur.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-6">
            <Card className="w-full max-w-5xl">
                <CardBody className="p-0">
                    <div className="grid md:grid-cols-2 h-full">
                        {/* Colonne gauche : formulaire */}
                        <div className="flex flex-col justify-between p-8 md:p-10">
                            {/* Logo / brand simple */}
                            <div className="mb-10">
                                <span className="font-semibold">ACME</span>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-2xl font-semibold mb-1">
                                        Welcome back
                                    </h1>
                                    <p className="text-small">
                                        Log in to your account to continue.
                                    </p>
                                </div>

                                {/* Boutons social login (dummy) */}
                                <div className="space-y-3">
                                    <Button
                                        fullWidth
                                        variant="bordered"
                                        type="button"
                                    >
                                        Continue with Google
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="bordered"
                                        type="button"
                                    >
                                        Continue with Github
                                    </Button>
                                </div>

                                {/* Divider OR */}
                                <div className="flex items-center gap-4">
                                    <Divider className="flex-1" />
                                    <span className="text-tiny uppercase tracking-wide">
                    OR
                  </span>
                                    <Divider className="flex-1" />
                                </div>

                                {/* Formulaire */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <FormInput
                                        label="Email Address"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        required
                                        placeholder="Enter your email"
                                    />

                                    <FormInput
                                        label="Password"
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                        required
                                        placeholder="Enter your password"
                                    />

                                    <div className="flex items-center justify-between gap-3">
                                        <Checkbox
                                            isSelected={remember}
                                            onValueChange={setRemember}
                                            size="sm"
                                        >
                                            Remember for 15 days
                                        </Checkbox>
                                        <button
                                            type="button"
                                            className="text-tiny underline-offset-2 hover:underline"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    {error && (
                                        <p className="text-tiny text-danger">
                                            {error}
                                        </p>
                                    )}

                                    <Button type="submit" color="primary" fullWidth>
                                        Log In
                                    </Button>
                                </form>
                            </div>

                            {/* Lien vers inscription */}
                            <div className="mt-8 text-tiny text-center">
                                Need to create an account?{" "}
                                <RouterLink
                                    to="/register"
                                    className="underline underline-offset-2"
                                >
                                    Sign Up
                                </RouterLink>
                            </div>
                        </div>

                        {/* Colonne droite : image + citation (desktop seulement) */}
                        <div className="relative hidden md:block">
                            <img
                                src="https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/white-building.jpg"
                                alt="Modern white building"
                                className="h-full w-full object-cover"
                            />

                            <div className="absolute inset-x-0 bottom-0 p-8 space-y-4">
                                <div className="flex items-center gap-3 justify-end">
                                    <div className="text-right">
                                        <p className="text-small font-semibold">
                                            Bruno Reichert
                                        </p>
                                        <p className="text-tiny">
                                            Founder &amp; CEO at ACME
                                        </p>
                                    </div>
                                    <img
                                        src="https://i.pravatar.cc/150?u=a04258a2462d826712d"
                                        alt="Bruno Reichert"
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                </div>

                                <p className="text-small italic text-right">
                                    “Lorem ipsum dolor sit amet, consectetur adipiscing
                                    elit. Nunc eget augue nec massa volutpat aliquet.”
                                </p>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Login;
