# PROJET TEST ARTHUR

## 🧩 Description du projet

Ce projet met en place une **architecture Docker complète** composée de :
- Un **frontend React (Vite + TypeScript)** pour l’interface utilisateur moderne
- Un **backend Spring Boot** (API REST sécurisée avec JWT)
- Une **base de données PostgreSQL** gérée par **Flyway**

L’objectif est de démontrer une intégration fluide entre un frontend React, un backend Java sécurisé et une base de données PostgreSQL dans un environnement conteneurisé.

---

## 🏗️ Structure du projet

```
Projet/
│
├── frontend/       # Application React (Vite + TypeScript)
│   ├── src/        # Pages, composants, services (API, AuthContext...)
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.ts
│
├── backend/        # Application Spring Boot
│   ├── src/        # Code source (Controller, Service, Repository, Security...)
│   ├── build.gradle
│   ├── Dockerfile
│   └── application.yml
│
├── db/             # Base PostgreSQL
│   ├── Dockerfile
│   └── init/       # Scripts d’initialisation
│
└── docker-compose.yml
```

---

## ⚙️ Fonctionnalités

### Frontend (React + Vite)
- Interface claire et responsive (Login, Inscription, Dashboard)
- Gestion de l’état utilisateur avec **AuthContext**
- Persistance du token JWT dans **localStorage**
- Communication directe avec l’API Spring Boot via Axios

### Backend (Spring Boot)
- Endpoints API :
  - `POST /api/auth/register` → Inscription utilisateur  
  - `POST /api/auth/login` → Connexion utilisateur  
  - `GET /api/auth/me` → Profil utilisateur connecté  
- Authentification **JWT**
- Documentation interactive via **Swagger UI**
- Migration de la base automatique avec **Flyway**
- Sécurité gérée avec **Spring Security + BCrypt**

### Base PostgreSQL
- Image : `postgres:17-alpine`
- Base : `lr_db`
- Utilisateur : `lr_user`
- Mot de passe : `lr_password`
- Table principale : `"user"`

---

## 🔄 Communication Frontend ↔ Backend

Le frontend communique avec le backend via les routes exposées sur :
```
http://localhost:8080/api/auth
```
Les requêtes sont autorisées grâce à la configuration **CORS** dans `SecurityConfig.java`.

Connexion de la base (dans `application-docker.yml`) :
```yaml
spring:
  datasource:
    url: jdbc:postgresql://db:5432/lr_db
    username: lr_user
    password: lr_password
```

---

## 🚀 Démarrer le projet

Depuis la racine du projet :

```bash
docker compose build
docker compose up
```

Services disponibles :
- **Frontend** : [http://localhost:3000](http://localhost:3000)  
- **API Backend** : [http://localhost:8080/swagger-ui](http://localhost:8080/swagger-ui)  
- **Base PostgreSQL** : `localhost:5432`

---

## 🧪 Tester via Swagger UI

1. Aller sur [http://localhost:8080/swagger-ui](http://localhost:8080/swagger-ui)
2. Tester les endpoints :
   - `POST /api/auth/register` → crée un utilisateur
   - `POST /api/auth/login` → obtient un JWT
   - Cliquer sur **Authorize** → coller le token
   - `GET /api/auth/me` → retourne les infos utilisateur

---

## 🗃️ Accéder à PostgreSQL via CLI

```bash
docker exec -it lr-db psql -U lr_user -d lr_db
```

Puis dans psql :

```sql
\dt
SELECT id, email, roles, created_at FROM "user";
\q
```

---

## 🎯 Objectif

Ce projet constitue une **base solide pour les applications web modernes** avec :
- Une **authentification complète** (register/login + JWT)
- Une **architecture conteneurisée prête pour la production**
- Un **frontend et backend découplés mais intégrés**
- Préparation à une future **intégration SSO (Keycloak, Azure AD, etc.)**

---

## ✨ Auteur

**Arthur Bouchaud**  
Développeur & futur expert en cybersécurité  
Projet de démonstration — AstroWeb Digital
