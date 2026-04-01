import React, { useState } from "react";
import { ShieldAlert, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";
import api from "@/services/auth/client";
import { AuthAPI } from "@/services/auth";

export default function ForcePasswordChangeModal() {
    const { user, setUser } = useAuth();
    const { isDark } = useTheme();

    const [form, setForm]       = useState({ next: "", confirm: "" });
    const [show, setShow]       = useState({ next: false, confirm: false });
    const [error, setError]     = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone]       = useState(false);

    if (!user?.mustChangePassword) return null;

    const toggle = (field) => setShow(s => ({ ...s, [field]: !s[field] }));

    const strength = (pw) => {
        if (pw.length === 0) return 0;
        let s = 0;
        if (pw.length >= 8) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        return s;
    };

    const strengthLabel = ["", "Faible", "Moyen", "Bon", "Excellent"];
    const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"];
    const strengthText  = ["", "text-red-400", "text-amber-400", "text-blue-400", "text-emerald-400"];

    const s = strength(form.next);

    const validate = () => {
        if (form.next.length < 8) return "Le mot de passe doit faire au moins 8 caractères.";
        if (form.next !== form.confirm) return "Les mots de passe ne correspondent pas.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }
        setError("");
        setLoading(true);
        try {
            await api.post("/api/profile/password/force", { newPassword: form.next });
            setDone(true);
            setTimeout(async () => {
                try {
                    const profile = await AuthAPI.profile();
                    setUser(profile);
                } catch (_) {}
            }, 1500);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || "Erreur lors du changement.";
            setError(typeof msg === "string" ? msg : "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    const inputCls = `w-full pl-4 pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/20
        ${isDark
            ? "bg-white/5 border-white/10 text-white focus:border-orange-500/50 placeholder:text-slate-600"
            : "bg-slate-50 border-slate-200 text-slate-800 focus:border-orange-400 focus:bg-white placeholder:text-slate-300"}`;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className={`absolute inset-0 ${isDark ? "bg-[#030614]/95" : "bg-slate-900/80"} backdrop-blur-md`} />

            <div className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl
                ${isDark ? "bg-[#0b0f26] border border-white/8" : "bg-white border border-slate-200"}`}>

                {/* Bande gradient */}
                <div className="h-1 bg-gradient-to-r from-orange-600 via-amber-400 to-orange-500" />

                {/* Header décoratif */}
                <div className={`px-8 pt-8 pb-6 text-center border-b ${isDark ? "border-white/6" : "border-slate-100"}`}>
                    <div className="relative inline-flex items-center justify-center mb-4">
                        <div className={`w-18 h-18 w-[72px] h-[72px] rounded-3xl flex items-center justify-center
                            ${isDark ? "bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20" : "bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200"}`}>
                            <ShieldAlert size={32} className="text-orange-500" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                            <Sparkles size={12} className="text-white" />
                        </div>
                    </div>
                    <h2 className={`text-xl font-black mb-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                        Bienvenue, {user?.firstname} !
                    </h2>
                    <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Pour sécuriser votre accès, définissez un mot de passe personnel avant de continuer.
                    </p>
                </div>

                <div className="px-8 py-6">
                    {done ? (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 size={32} className="text-emerald-500" />
                            </div>
                            <div className="text-center">
                                <p className={`font-black text-base ${isDark ? "text-white" : "text-slate-800"}`}>
                                    Mot de passe défini !
                                </p>
                                <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    Vous allez être redirigé...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Nouveau mot de passe */}
                            <div>
                                <label className={`text-xs font-bold uppercase tracking-widest mb-2 block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    Nouveau mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={show.next ? "text" : "password"}
                                        value={form.next}
                                        onChange={e => setForm(f => ({ ...f, next: e.target.value }))}
                                        placeholder="Choisissez un mot de passe fort"
                                        className={inputCls}
                                        autoComplete="new-password"
                                        autoFocus
                                    />
                                    <button type="button" onClick={() => toggle("next")}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}>
                                        {show.next ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>

                                {/* Barre de force */}
                                {form.next.length > 0 && (
                                    <div className="mt-2 space-y-1.5">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= s ? strengthColor[s] : isDark ? "bg-white/10" : "bg-slate-200"}`} />
                                            ))}
                                        </div>
                                        <p className={`text-[11px] font-semibold ${strengthText[s]}`}>
                                            {strengthLabel[s]}
                                            {s < 4 && <span className={`ml-1 ${isDark ? "text-slate-600" : "text-slate-300"}`}>— ajoutez majuscules, chiffres, symboles</span>}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirmer */}
                            <div>
                                <label className={`text-xs font-bold uppercase tracking-widest mb-2 block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    Confirmer le mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={show.confirm ? "text" : "password"}
                                        value={form.confirm}
                                        onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                                        placeholder="Répétez votre mot de passe"
                                        className={`${inputCls} ${form.confirm && form.confirm !== form.next ? (isDark ? "border-red-500/50" : "border-red-400") : form.confirm && form.confirm === form.next ? (isDark ? "border-emerald-500/50" : "border-emerald-400") : ""}`}
                                        autoComplete="new-password"
                                    />
                                    <button type="button" onClick={() => toggle("confirm")}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}>
                                        {show.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                    {form.confirm && form.confirm === form.next && (
                                        <CheckCircle2 size={15} className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    )}
                                </div>
                            </div>

                            {/* Erreur */}
                            {error && (
                                <div className={`flex items-center gap-2.5 p-3 rounded-xl text-sm ${isDark ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-red-50 border border-red-200 text-red-600"}`}>
                                    <AlertCircle size={15} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/30 hover:brightness-110 transition-all disabled:opacity-60"
                            >
                                {loading
                                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <Lock size={15} />
                                }
                                {loading ? "Enregistrement..." : "Définir mon mot de passe"}
                            </button>

                            <p className={`text-center text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                                Cette étape est obligatoire pour accéder à la plateforme.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
