import React from "react";

const HomeFooter = () => {
    return (
        <footer className="bg-[#050b1a] text-slate-300 pt-14 pb-6">
            <div className="mx-auto max-w-6xl px-4">
                <div className="grid gap-10 md:grid-cols-[2fr,1fr,1fr]">
                    {/* Col 1 : texte + logo mini */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-7 w-7 rounded-md bg-blue-500" />
                            <div className="h-7 w-7 rounded-md bg-[#ff9c2f]" />
                            <div className="flex flex-col leading-tight ml-2">
                <span className="text-sm font-semibold text-white">
                  Le Réseau
                </span>
                                <span className="text-[11px] text-slate-400">Formation</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 max-w-md">
                            La référence en formation pour créer et développer votre agence de
                            location de véhicules. Accompagnement personnalisé et méthodes
                            éprouvées.
                        </p>
                    </div>

                    {/* Col 2 : liens rapides */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">
                            Formations
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>Formations</li>
                            <li>Communauté</li>
                            <li>Experts</li>
                            <li>Outils</li>
                            <li>À propos</li>
                        </ul>
                    </div>

                    {/* Col 3 : contact */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>📧 contact@lereseauformation.fr</li>
                            <li>📞 +33 1 23 45 67 89</li>
                            <li>📍 Paris, France</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 border-t border-slate-800 pt-4 text-center text-xs text-slate-500">
                    © 2025 Le Réseau Formation. Tous droits réservés. | Organisme de formation certifié DATADOCK
                </div>
            </div>
        </footer>
    );
};

export default HomeFooter;
