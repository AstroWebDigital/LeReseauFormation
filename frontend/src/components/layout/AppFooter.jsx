import React from "react";

const AppFooter = () => {
    return (
        <footer className="px-4 py-8 border-t border-default-100 bg-background/80">
            <div className="max-w-5xl mx-auto grid gap-8 sm:grid-cols-3 text-xs text-default-500">
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Le Réseau</h3>
                    <p>
                        La référence en formation pour créer et développer votre agence de
                        location de véhicules. Accompagnement personnalisé et méthodes
                        éprouvées.
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Liens rapides</h3>
                    <ul className="space-y-1">
                        <li>Formations</li>
                        <li>Communauté</li>
                        <li>Experts</li>
                        <li>Outils</li>
                        <li>À propos</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Contact</h3>
                    <ul className="space-y-1">
                        <li>📧 contact@lereseauformation.fr</li>
                        <li>📞 +33 1 23 45 67 89</li>
                        <li>📍 Paris, France</li>
                    </ul>
                </div>
            </div>

            <div className="max-w-5xl mx-auto mt-6 border-t border-default-100 pt-4 text-[11px] text-default-500 flex flex-wrap gap-2 justify-between">
        <span>
          © 2025 Le Réseau Formation. Tous droits réservés.
        </span>
                <span>Organisme de formation certifié DATADOCK</span>
            </div>
        </footer>
    );
};

export default AppFooter;
