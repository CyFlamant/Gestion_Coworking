EAFC Namur Cadets – Bachelier Informatique – Projet d’intégration de développement

Année 2026-2027

Professeur : M. Yolan Fery

Etudiant : Cyrille Flamant

**Plan d’implémentation**

Application de gestion d’un espace de coworking

version : 8/10/26

Modifications :

- 8/10 :
  - Ajout d’une classe « Site »
  - Traduction du diagramme de classes en anglais
  - Planning : déploiement de la partie « App-Service » avant le déploiement final

# Démarche d’implémentation

Pour le développement de cette application, je chercherai à produire un premier livrable le plus rapidement possible, qui ne comprendra pas toutes les fonctions prévues mais permettra de tester l’application et de démontrer la viabilité de chaque fonctionnalité au fur et à mesure.

Cette première version se limitera donc aux fonctionnalités qui forment le cœur du projet : la gestion des réservations par un client (consultation, création et suppression d’une réservation pour un espace de travail à des dates et heures données). Les autres fonctionnalités (gestion des comptes, création d’un rôle « Administrateur », envoi d’e-mails de confirmation) seront ajoutées ultérieurement, et mon application devra donc prévoir la possibilité de les ajouter (ajout de nouvelles classes, ajout d’attributs et méthodes aux classes existantes, mise à jour de la BD et migration des données).

Cette démarche permettra d’obtenir rapidement un retour du client et de disposer d'une base pour construire et tester l'application au fur et à mesure. De plus, elle m’obligera à prévoir l’évolutivité de l’application, ce qui peut être utile même après l’ajout des fonctionnalités prévues dans le périmètre initial.

# Architecture de l’application

L’application prendra la forme d’une application web responsive réalisée en 3 tiers : couche d’interface, couche applicative et base de données.

### Couche d’interface

L’interface sera réalisée avec React. Je n’ai encore aucune expérience de React et je voudrais apprendre à l’utiliser, puisqu’il s’agit d’une des bibliothèques les plus courantes pour le front-end.

### Couche applicative

La couche applicative sera développée en Java/Springboot pour la raison inverse : il s’agit d’une technologie que j’ai déjà utilisée. Cela me permettra donc d’approfondir mes connaissances et de me consacrer davantage aux aspects que je maîtrise moins : front-end, tests et déploiement.

### Base de données

Les données persistantes seront stockées dans un SGBD utilisant le standard MySQL, par souci de simplicité et pour une intégration facile avec Springboot.

Le mapping relationnel entre entités Java et tables de la BD sera réalisé avec Hibernate,associé à Flyway pour la migration des données.

### Structure en microservices

L’authentification des utilisateurs se fera via un microservice séparé, pour lequel je réaliserai un projet springboot et une base de données distincts. Le service d’authentification transmettra un token JWT à React.

# Gestion du code

Le code ainsi que la documentation seront déposés sur un repository GitHub à mesure de la réalisation du projet.

# Planification du développement

Dans un premier temps, les fonctionnalités nécessaires à un premier livrable seront développées et testées. Ces fonctions sont les suivantes : consultation, création et suppression d’une réservation pour un espace de travail à des dates et heures données, avec gestion des accès concurrents par la DB. A ce stade l’application utilisera un identifiant utilisateur fixe, qui sera remplacé par l'identité extraite du JWT lors de l'ajout du microservice d'authentification.

Les fonctionnalités restantes seront ajoutées et testées au fur et à mesure dans l’ordre suivant :

- Microservice d’authentification, création de compte et récupération du mot de passe
- Rôle « Administrateur » avec fonctions de gestion des comptes
- Gestion des espaces et des tarifs
- Fonctions d’envoi d’e-mails de confirmation

# Stratégie de test

- Tests unitaires des principales fonctions
- Selon le temps disponible, tests d’intégration et tests de bout en bout

# Déploiement

Le déploiement se fera probablement à l’aide de Docker, mais je ne dispose pas encore des connaissances nécessaires pour détailler davantage cette étape. L’application sera hébergée chez un fournisseur cloud type Azure ou AWS.

# Diagramme de classes

![image1](<images/Plan d'implementation/image1.png>)

# Respect des exigences non fonctionnelles

- **Sécurité** : mots de passe hachés, validation du token JWT, validation des entrées, protection contre l’injection SQL et les attaques XSS
- **RGPD** : collecte uniquement des données nécessaires, accès de l’utilisateur à ses données
- **Temps de réponse** : index sur les colonnes de recherche, pagination des résultats
- **Disponibilité** : mesures à définir lors du déploiement
- **Fiabilité** : gestion des transactions et accès concurrents, messages d’erreur clairs
- **Évolutivité** : séparation en microservices, migrations Flyway

# Planning prévisionnel

- 15/10 : App-service (fonctions de réservation et de gestion des espaces) : couche applicative + BD
- 5/11 :
  - App-service : tests unitaires et couche d’interface
  - Déploiement de l’app-service
- 12/11 : Auth-service (gestion des comptes et authentification) : couche applicative + BD
- 19/11 : Auth-service : tests unitaires et couche d’interface
- 26/11 : Ajout de la fonction d’e-mails et résolution des problèmes techniques restants
- 3/12 : Déploiement du service Authentification
- 10/12 : Analyse de sécurité
- 17/12 : Révision et revue techniques
