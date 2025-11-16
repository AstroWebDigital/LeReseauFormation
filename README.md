# PROJET TEST ARTHUR – Plateforme « Le Réseau Formation »

## 🧩 Description du projet

Ce dépôt contient une stack complète prête à l’emploi pour une application de démonstration **Le Réseau Formation** :

- **Frontend** : SPA React (Vite + TypeScript) avec **HeroUI** et **Tailwind CSS** pour l’UI.
- **Backend** : API REST **Spring Boot 3** sécurisée par **JWT**.
- **Base de données** : **PostgreSQL 17** avec migrations gérées par **Flyway**.
- L’ensemble tourne dans un environnement **Docker Compose** reproductible.

L’objectif est de disposer d’un socle moderne pour expérimenter :
- l’authentification JWT (inscription / connexion),
- la communication Frontend ↔ Backend,
- un design marketing inspiré de la maquette Figma « Le Réseau Formation ».

---

## 🏗️ Structure du projet

```bash
.
├── backend/                # API Spring Boot (security, JWT, Flyway, JPA…)
├── db/                     # Scripts d'initialisation PostgreSQL
├── frontend/               # Application React (Vite + TS + HeroUI + Tailwind)
├── docker-compose.yml      # Orchestration des 3 services
└── README.md
```

---

## 🎨 Frontend – React + Vite + HeroUI + Tailwind

### Stack technique

Le frontend se trouve dans le dossier `frontend/` et s’appuie sur :

- **React** `18.3.1`
- **React DOM** `18.3.1`
- **React Router DOM** `6.28.0`
- **Vite** `5.4.21` (bundler / dev server)
- **TypeScript** `5.6.3`
- **Tailwind CSS** `4.0.0-beta.8`
- **HeroUI React** `2.4.23`
    - `@heroui/react`
    - `@heroui/system`
    - `@heroui/theme`
- **Lucide React** `0.469.0` (pictos SVG)
- **Axios** `1.7.9` (appel API)

Ces versions proviennent du `frontend/package.json`.

### Design system

Le design reprend la maquette Figma :

- **Navbar** : logo `Logo-Reseau-Formation.png`, liens de navigation centrés, CTA *« Consultation Gratuite »* (HeroUI `Button`).
- **HeroSection** :
    - Titre principal sur deux lignes, accent en orange `#ff9c2f`.
    - Fond **dégradé** (blue navy) via Tailwind `bg-gradient-to-br`.
    - 3 statistiques : *Entreprises créées, CA généré, % de réussite*.
    - Deux CTA HeroUI (`Button`) :
        - *Démarrer ma consultation gratuite* (bouton principal orange).
        - *Découvrir nos formations* (bouton secondaire blanc, variant `bordered`).
- Le reste de la page d’accueil est découpé en sections : témoignages, programmes, timeline, offres de formation, processus d’inscription, communauté, call‑to‑action final et footer.

### Librairies UI

Les composants HeroUI sont utilisés pour :

- **Navbar** : `Navbar`, `NavbarBrand`, `NavbarContent`, `NavbarItem`, `Button`.
- **Boutons & CTA** : `Button` (variants `solid`, `bordered`, `ghost`, etc.).
- **Cartes et layout** (au fur et à mesure des sections) : `Card`, `CardBody`, …

Le style global est géré par Tailwind + le thème HeroUI, configurés dans :

- `frontend/src/styles/global.css` (import Tailwind + plugin HeroUI)
- `frontend/src/styles/theme/hero.ts` (personnalisation du thème HeroUI)
- `tailwind.config.js` (intégration HeroUI / Tailwind)

### Documentation HeroUI

Pour ajouter / modifier des composants UI, se référer à la documentation officielle :

👉 **HeroUI – Introduction**  
https://www.heroui.com/docs/guide/introduction

Les composants utilisés (Navbar, Button, Card, etc.) sont documentés dans la section **Components** :
https://www.heroui.com/docs/components/navbar  
https://www.heroui.com/docs/components/button

### Lancer uniquement le frontend (hors Docker)

Depuis le dossier `frontend/` :

```bash
# Installation des dépendances
npm install

# Lancer le serveur de dev Vite
npm run dev

# Build de production
npm run build
```

Le frontend est alors accessible sur `http://localhost:5173` (par défaut Vite).

---

## 🧰 Backend – Spring Boot + PostgreSQL

- **Spring Boot** 3.x
- **Java** 21 (Temurin)
- **Spring Security** + **JWT** pour l’authentification.
- **Spring Data JPA** pour l’accès aux données.
- **Flyway** pour les migrations SQL.
- **PostgreSQL** 17 (service Docker `db`).

Les principaux points :

- Configuration Docker spécifique dans `application-docker.yml`.
- Migrations Flyway dans `backend/src/main/resources/db/migration`.
- Configuration de la sécurité et des endpoints d’authentification dans `SecurityConfig.java` & contrôleurs associés.

L’API est exposée sur :

```text
http://localhost:8080/api/auth
```

(Inscription, connexion, endpoints protégés, etc.)

---

## 🐳 Environnement Docker

Le fichier `docker-compose.yml` orchestre :

- `lr-frontend` : build à partir de `frontend/Dockerfile` (Vite → build → `serve` en production).
- `lr-backend`  : build Gradle, exécution du JAR Spring Boot.
- `lr-db`       : PostgreSQL 17 avec initialisation (`db/init`).

### Lancer la stack complète

À la racine du projet :

```bash
# Arrêter et supprimer les conteneurs + volumes
docker compose down -v

# Rebuild complet + démarrage en arrière-plan
docker compose up -d --build

# Suivre les logs
docker compose up
```

Services exposés :

- Frontend : http://localhost:3000
- Backend  : http://localhost:8080
- PostgreSQL accessible dans le réseau Docker sous le host `db` (port 5432).

---

## 🔄 Communication Frontend ↔ Backend

Le frontend envoie ses requêtes au backend Spring Boot :

```text
http://localhost:8080/api/auth
```

La politique CORS est configurée dans le backend pour autoriser le domaine du frontend.  
L’authentification repose sur des **tokens JWT** stockés côté client (par exemple via `localStorage` ou contexte React).

---

## ✅ TODO / pistes d’évolution

- Intégrer toutes les sections de la maquette Figma (Formations, Communauté, Experts, etc.).
- Ajouter la gestion complète des états d’authentification (guard routes, refresh token…).
- Mettre en place des tests E2E (Playwright / Cypress) pour valider les parcours utilisateurs.
- Ajouter un mode « preview » statique pour la landing marketing (sans authentification).

---

Ce README sera amené à évoluer au fur et à mesure que le design Figma et les fonctionnalités (dashboard, formulaires, etc.) seront intégrés.
