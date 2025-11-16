# 02 – Générer une entité JPA à partir d’une table SQL existante
_(IntelliJ Ultimate + Spring Boot + PostgreSQL + Flyway)_

Ce guide décrit la démarche **dans le sens : Table SQL → Entité JPA**.

> Cas d’usage typique :  
> - Tu as **déjà une table dans PostgreSQL** (schéma existant, base legacy, test rapide).  
> - Tu veux **générer automatiquement la classe d’entité** dans le projet Spring Boot.

⚠️ **Important** : dans un vrai projet, la source de vérité doit rester les
migrations Flyway. Cette méthode sert surtout à _mapper_ une base déjà en place
ou importée, pas à contourner Flyway.

---

## 0. Pré‑requis

- IntelliJ **Ultimate**
- Projet Spring Boot configuré avec Spring Data JPA.
- Une table déjà présente dans la base PostgreSQL, par exemple :

```sql
CREATE TABLE example (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- Connexion PostgreSQL configurée dans IntelliJ (ex. `lr_db@localhost`)
  pointant sur `lr_db` dans Docker.

---

## 1. Vérifier / rafraîchir la table dans IntelliJ

1. Ouvrir l’onglet **Database** (à droite dans IntelliJ).
2. Sur la connexion `lr_db@localhost` :
   - Clic droit → **Jump to Query Console** pour tester un `SELECT * FROM example;`  
   - ou **Refresh** pour recharger la liste des tables.
3. Vérifier que la table `example` apparaît bien dans :  
   `lr_db → public → tables → example`.

---

## 2. Lancer l’assistant « JPA Entities from DB… »

1. Dans l’arborescence du projet, aller dans le package des entités :
   ```text
   src/main/java/com/example/backend/entity
   ```
2. Clic droit sur le package `entity` → **New** → **Other** →
   **JPA Entities from DB…**  
   (c’est le menu que tu as ouvert sur ton screen).

Une fenêtre **JPA Entities from DB** s’ouvre.

---

## 3. Configurer « JPA Entities from DB »

Dans cette fenêtre :

1. **DB connection**  
   - Sélectionner `lr_db@localhost (jdbc:postgresql://localhost:15432/lr_db)`.

2. **Source root**  
   - Vérifier que c’est bien :  
     `[backend.main] …\src\main\java`

3. **Options**  
   - Cocher :
     - ✅ `Migrate indexes and constraints`
     - ✅ `Migrate default values`
   - (Option `Use table schema` peut rester décochée si tu es sur le schéma `public`).

4. **Target package**  
   - Mettre : `com.example.backend.entity`

5. Dans l’arbre à gauche, sous **Tables** :  
   - Déplier `Tables`  
   - Cocher uniquement la table `example` (pour l’exemple).

6. À droite, IntelliJ te montre le mapping :
   - `id` → attribut `id`, type **UUID**
   - `name` → attribut `name`, type **String**
   - `description` → attribut `description`, type **String**
   - `created_at` → attribut `createdAt`, type **OffsetDateTime** (ou autre type temps).

7. **ID generation**  
   - Choisir **UUID** pour coller à la définition `UUID DEFAULT gen_random_uuid()`
     (comme sur ton screen).

8. Cliquer sur **OK**.

IntelliJ va générer automatiquement la classe d’entité correspondante.

---

## 4. Résultat : classe générée

Tu obtiens un fichier, par exemple :
```text
src/main/java/com/example/backend/entity/Example.java
```

Avec un contenu du style (simplifié) :

```java
package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

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

Tu peux ensuite :
- Ajouter des annotations de validation (`@NotNull`, `@Size`, etc.) si besoin.
- Créer un repository Spring Data :
  ```java
  public interface ExampleRepository extends JpaRepository<Example, UUID> {}
  ```

---

## 5. Remettre Flyway dans la boucle (recommandé)

Si la table `example` a été créée **manuellement** (psql) et non par Flyway :

1. Récupérer le SQL de création (celui utilisé au départ).
2. Créer un fichier de migration Flyway, par exemple :
   ```text
   src/main/resources/db/migration/V6__create_example_table.sql
   ```
3. Y coller le `CREATE TABLE example (...)`.
4. Redémarrer la stack Docker (`down -v` puis `up -d --build`) pour repartir
   d’une base vierge que Flyway recréera entièrement.

À partir de là :
- La **table** vient de Flyway,
- L’**entité** vient de l’assistant IntelliJ,
- Les deux restent synchronisés.

---

## 6. Récapitulatif rapide (Table → Entité)

1. Créer / vérifier la table dans PostgreSQL (via script SQL, psql, etc.).
2. Rafraîchir la connexion DB dans IntelliJ et vérifier la table dans l’onglet **Database**.
3. Clic droit sur `com.example.backend.entity` → **New → Other → JPA Entities from DB…**.
4. Choisir la bonne **DB connection** + **Source root** + **Target package**.
5. Cocher la table voulue (ex. `example`) et régler le mapping des colonnes.
6. Cliquer sur **OK** → la classe d’entité est générée.
7. (Optionnel mais conseillé) Créer une migration Flyway pour cette table si elle n’existe pas encore dans `db/migration`.
