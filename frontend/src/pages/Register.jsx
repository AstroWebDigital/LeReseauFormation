// src/pages/Register.jsx
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
    Card,
    CardBody,
    Button,
    Checkbox,
    Divider,
} from "@heroui/react";
import { AuthAPI } from "../services/auth";

import FormInput from "../components/FormInput";

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (!acceptedTerms) {
            setError("Tu dois accepter les conditions d'utilisation.");
            return;
        }

        try {
            const result = await AuthAPI.register({
                firstname: form.firstname,
                lastname: form.lastname,
                email: form.email,
                password: form.password,
                // phone / sector à ajouter plus tard si besoin
            });


            // console.log("Register success:", result);

            // ✅ Si on arrive ici, c’est que le backend a répondu 2xx → on considère que c’est OK
            // Tu pourras plus tard rediriger vers une page : "Vérifie tes emails pour activer ton compte"
            navigate("/login");
        } catch (err) {
            // console.error("Register error:", err);

            const backendData = err?.response?.data;

            const msg =
                (backendData && backendData.message) ||       // JSON { message: "..." }
                (typeof backendData === "string" && backendData) || // plain text "Email déjà utilisé"
                err?.message ||
                "Erreur lors de l'inscription ou email déjà utilisé.";

            setError(msg);
        }

    };


    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-6">
            <Card className="w-full max-w-5xl">
                <CardBody className="p-0">
                    <div className="grid md:grid-cols-2 h-full">
                        {/* Colonne gauche : formulaire */}
                        <div className="flex flex-col justify-between p-8 md:p-10">
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-2xl font-semibold mb-1">
                                        Create Account
                                    </h1>
                                    <p className="text-small">
                                        Sign up for a new account to get started.
                                    </p>
                                </div>

                                {/* Social signup */}
                                <div className="space-y-3">
                                    <Button
                                        fullWidth
                                        variant="bordered"
                                        type="button"
                                    >
                                        Sign Up with Google
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="bordered"
                                        type="button"
                                    >
                                        Sign Up with Github
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

                                {/* Formulaire inscription */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput
                                            label="First name"
                                            name="firstname"
                                            value={form.firstname}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your first name"
                                        />
                                        <FormInput
                                            label="Last name"
                                            name="lastname"
                                            value={form.lastname}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your last name"
                                        />
                                    </div>

                                    <FormInput
                                        label="Email Address"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your email"
                                    />

                                    <FormInput
                                        label="Password"
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Create a password"
                                    />

                                    <FormInput
                                        label="Confirm Password"
                                        type="password"
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="Confirm your password"
                                    />

                                    <Checkbox
                                        isSelected={acceptedTerms}
                                        onValueChange={setAcceptedTerms}
                                        size="sm"
                                    >
                                        I agree with the{" "}
                                        <button
                                            type="button"
                                            className="underline underline-offset-2"
                                        >
                                            Terms
                                        </button>{" "}
                                        and{" "}
                                        <button
                                            type="button"
                                            className="underline underline-offset-2"
                                        >
                                            Privacy Policy
                                        </button>
                                    </Checkbox>

                                    {error && (
                                        <p className="text-tiny text-danger">
                                            {error}
                                        </p>
                                    )}

                                    <Button type="submit" color="primary" fullWidth>
                                        Sign Up
                                    </Button>
                                </form>
                            </div>

                            <div className="mt-8 text-tiny text-center">
                                Already have an account?{" "}
                                <RouterLink
                                    to="/login"
                                    className="underline underline-offset-2"
                                >
                                    Log In
                                </RouterLink>
                            </div>
                        </div>

                        {/* Colonne droite : image + citation */}
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

export default Register;
