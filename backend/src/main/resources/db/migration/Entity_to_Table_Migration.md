# 01 – Générer une migration SQL Flyway à partir d’une entité JPA
_(IntelliJ Ultimate + Spring Boot + PostgreSQL + Flyway)_

Ce guide décrit la démarche **dans le sens : Entité → Script SQL Flyway → BDD**.

> Workflow :  
> **1. Création de l’entité JPA → 2. Generate DDL by Entities → 3. Sauvegarde dans `db/migration` → 4. Redémarrage Docker**

---

## 0. Pré‑requis

- IntelliJ **Ultimate**
- Projet Spring Boot configuré avec :
  - Spring Data JPA
  - Flyway (`src/main/resources/db/migration`)
- Base PostgreSQL accessible depuis IntelliJ (connexion de type `lr_db@localhost`
  pointant vers le conteneur Docker).

---

## 1. Créer l’entité JPA

1. Dans le module `backend`, créer une nouvelle classe dans le package :
   ```text
   src/main/java/com/example/backend/entity
   ```

2. Exemple d’entité (à adapter) :
   ```java
   package com.example.backend.entity;

   import jakarta.persistence.*;
   import java.util.UUID;
   import java.time.OffsetDateTime;

   @Entity
   @Table(name = "example")
   public class Example {

       @Id
       @GeneratedValue(strategy = GenerationType.UUID)
       @Column(name = "id", nullable = false)
       private UUID id;

       @Column(name = "name", nullable = false, length = 100)
       private String name;

       @Column(name = "description")
       private String description;

       @Column(name = "created_at", nullable = false)
       private OffsetDateTime createdAt;

       // getters / setters / constructeur vide…
   }
   ```

3. Vérifier :
   - présence de `@Entity`,
   - nom de table correct dans `@Table(name = "...")`,
   - colonnes correctement annotées (`@Column`, `nullable`, `length`, etc.).

---

## 2. Ouvrir « Generate DDL by Entities… »

1. Ouvrir le fichier de l’entité dans IntelliJ.
2. Placer le curseur sur la ligne de la classe, par ex. :
   ```java
   public class Example {
   ```
3. Faire **clic droit → Generate…** (ou **Alt+Insert**).
4. Choisir **`Generate DDL by Entities…`**.

Une fenêtre « Generate DDL by Entities… » s’ouvre (comme sur le screen 1).

---

## 3. Configuration de « Generate DDL by Entities… »

Dans la fenêtre :

1. **DDL type**
   - Cocher : **`Existing DB update (Diff)`**
   - (l’autre option `DB schema initialization` recréerait tout le schéma).

2. **Entities**
   - **Persistence unit** : sélectionner l’unité du projet (ex. `backend.main`).
   - **Source scope** : choisir
     - `Selected Entities` si tu ne veux générer le diff que pour l’entité sélectionnée,
     - ou le scope qui t’intéresse.

3. **Database**
   - **DB connection** : choisir la connexion PostgreSQL, ex. :
     ```text
     lr_db@localhost (jdbc:postgresql://localhost:15432/lr_db)
     ```
   - C’est cette base que IntelliJ utilisera pour calculer le diff.

4. Valider avec **OK**.

IntelliJ calcule maintenant les différences entre l’entité JPA et la base,
puis ouvre la fenêtre **DDL by Entities Preview** (screen 2).

---

## 4. Fenêtre « DDL by Entities Preview »

Dans cette fenêtre tu vois :

- À gauche : la liste des opérations générées
  (création de table, ajout/suppression de colonnes, contraintes, etc.).
- Au centre : le SQL complet correspondant.

### 4.1 Choisir ce que tu veux appliquer

- Vérifier que les opérations listées correspondent à ce que tu veux **vraiment** faire
  (création de table, modification de clé étrangère, etc.).
- Tu peux décocher des éléments si tu ne veux pas les inclure dans le fichier SQL.

### 4.2 Sauvegarder en migration Flyway

En haut à droite :

1. Cocher **Save as → File**.
2. **Directory** : choisir
   ```text
   src/main/resources/db/migration
   ```
3. **File name** : respecter la convention Flyway, par ex. :
   ```text
   V6__create_example_table.sql
   ```
   - `V6` = numéro de version suivant la dernière migration existante.
   - `__` (double underscore) obligatoire.
   - `create_example_table` = description courte en snake_case.

4. Vérifier une dernière fois le SQL généré.
5. Cliquer sur **Save**.

Le fichier est maintenant dans `src/main/resources/db/migration` et Flyway le
prendra en compte au prochain démarrage de l’application.

---

## 5. Appliquer la migration (Docker)

1. **Arrêter** les conteneurs existants et supprimer le volume de la BDD si tu
   repars de zéro :
   ```bash
   docker compose down -v
   ```

2. **Rebuild & restart** les services :
   ```bash
   docker compose up -d --build
   ```

3. Vérifier les logs du backend pour voir les migrations Flyway appliquées :
   ```bash
   docker compose logs backend -f
   ```

   Tu dois voir quelque chose comme :
   ```text
   Migrating schema "public" to version "6 - create example table"
   Successfully applied 1 migration to schema "public", now at version v6
   ```

À ce stade, la nouvelle table générée à partir de l’entité est bien créée
dans PostgreSQL, et Hibernate pourra l’utiliser normalement.

---

## 6. Récapitulatif rapide (Entité → Table)

1. Créer / modifier une entité JPA dans `com.example.backend.entity`.
2. Clic droit sur `public class NomEntite` → **Generate…** →
   **Generate DDL by Entities…**.
3. Choisir **Existing DB update (Diff)** + bonne connexion DB.
4. Dans le preview, enregistrer le SQL en fichier :
   `src/main/resources/db/migration/Vx__description.sql`.
5. Redémarrer les conteneurs Docker (`docker compose down -v` puis `up -d --build`).
6. Vérifier dans les logs du backend que Flyway a bien appliqué la migration.
