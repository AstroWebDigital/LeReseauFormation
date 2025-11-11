# PROJET TEST ARTHUR

## 🧩 Description du projet

Ce projet met en place une **architecture Docker complète** composée de :
- Un **backend Spring Boot** (API REST sécurisée avec JWT)
- Une **base de données PostgreSQL** gérée par **Flyway**

Il permet de tester l’interconnexion entre un serveur d’API Java et une base PostgreSQL, dans un environnement entièrement conteneurisé.

---

## 🏗️ Structure du projet

```
Projet/
│
├── backend/        # Application Spring Boot
│   ├── src/        # Code source (Controller, Service, Repository, etc.)
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

### Backend (Spring Boot)
- Endpoints API :  
  - `POST /api/auth/register` → Inscription utilisateur  
  - `POST /api/auth/login` → Connexion utilisateur  
  - `GET /api/auth/me` → Profil utilisateur connecté  
- Authentification **JWT**
- Documentation interactive via **Swagger UI**
- Migration de la base automatique avec **Flyway**

### Base PostgreSQL
- Image : `postgres:17-alpine`
- Base : `lr_db`
- Utilisateur : `lr_user`
- Mot de passe : `lr_password`
- Table principale : `"user"`

---

## 🔄 Relation entre backend et base

Le backend communique avec PostgreSQL via le réseau Docker.

Connexion déclarée dans `application-docker.yml` :
```yaml
spring:
  datasource:
    url: jdbc:postgresql://db:5432/lr_db
    username: lr_user
    password: lr_password
```

Grâce à Docker Compose, le service `backend` accède au conteneur `db` directement par son nom.

Lors du démarrage :
1. Le conteneur `db` initialise PostgreSQL.  
2. Le conteneur `backend` démarre, applique les migrations Flyway.  
3. L’API est prête à être utilisée.

---

## 🚀 Démarrer le projet

Depuis la racine du projet :

```bash
docker compose build
docker compose up
```

Services disponibles :
- **API** : [http://localhost:8080/swagger-ui](http://localhost:8080/swagger-ui)  
- **PostgreSQL** : `localhost:5432`

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
SELECT id, email, roles, provider, created_at FROM "user";
\q
```

---

## 🎯 Objectif

Ce projet sert de **base technique** pour :
- Tester l’intégration Spring Boot / PostgreSQL sous Docker
- Gérer un flux d’authentification JWT complet
- Préparer l’ajout futur d’un **SSO** (Keycloak, Azure AD, etc.)

---

## ✨ Auteur

**Arthur Bouchaud**  
Développeur & futur expert en cybersécurité  
Projet de test – AstroWeb Digital
