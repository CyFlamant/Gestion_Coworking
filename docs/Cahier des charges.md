EAFC Namur Cadets – Bachelier Informatique – Projet d’intégration de développement

Année 2026-2027

Professeur : M. Yolan Fery

Etudiant : Cyrille Flamant

Cahier des charges

Application de gestion d’un espace de coworking

version : 02/10/26

Modifications :

- 28/09 : la fonction de tableau de bord a été placée dans les fonctions supplémentaires potentielles
- 29/09 : le prix doit être calculé et affiché lors de la réservation
- 8/10 : Distinction entre consultation (pour tous les visiteurs) et réservation (pour les clients authentifiés)

# Contexte et objectifs

Un espace de coworking doit s’ouvrir prochainement et recherche une application pour faciliter sa gestion.

L’espace comporte des places en open space, des bureaux individuels ainsi que des salles de réunion. Les espaces peuvent être loués par heure, demi-journée, journée ou par mois.

Le gérant souhaite disposer d’une application pour créer, modifier ou supprimer des places de coworking et gérer les horaires et les tarifs.

L’application doit aussi permettre aux clients de créer des comptes, de rechercher des espaces disponibles et de réserver en ligne.

# Périmètre

Deux types d’utilisateurs sont prévus : Administrateur et Client.

À ce stade, l’application n’est pas associée à un système de paiement – le paiement s’effectue uniquement sur place.

De plus, aucun accès autonome aux locaux n’est prévu, l’espace est uniquement accessible lorsque du personnel est présent pour accueillir les visiteurs.

# Besoins fonctionnels

### Fonctionnalités de gestion des utilisateurs

- Authentification de l’utilisateur via email et mot de passe, avec fonction de récupération du mot de passe
- Création de comptes utilisateur avec confirmation par e-mail
- Chaque utilisateur a accès à ses données et peut les mettre à jour

### Fonctionnalités de l’administrateur

- Interface CRUD pour la gestion des espaces et des tarifs
- Modifier ou suppression de comptes
- Création, modification et suppression de réservations

### Fonctionnalités du visiteur

- Recherche d’espaces disponibles par date/heure et type
- Consultation des espaces disponibles et calcul des prix

### Fonctionnalités du client authentifié

- Réservation d’espaces ; lors d’une réservation, le système affiche le prix calculé
- Annulation de réservations

### Persistance des données

Sauvegarde des données dans un SGBD avec gestion des accès concurrentiels et des transactions

### Communication

- Envoi d’e-mails de confirmation après la création d’un compte ou d’une réservation
- Possibilité d’envoyer des e-mails d’information à tous les clients enregistrés dans la base de données, par exemple en cas de fermeture imprévue du lieu

# Besoins non fonctionnels

- Sécurité des données
- Conformité RGPD
- Temps de réponse
- Disponibilité
- Fiabilité / Tolérance aux pannes
- Évolutivité (plus d’espaces, plus d’utilisateurs)

# Fonctionnalités supplémentaires potentielles

- Fonctionnement multi-sites
- Tableau de bord pour la consultation du solde d’heures des clients
- Accès autonome aux locaux via un code d’accès
- Fonctionnalités de paiement / facturation
- Location de matériel (écran, projecteur…)
- Réservation de tout l’espace pour événements
- Rôle « Agent d’accueil » avec fonctions de gestion simplifiée pour enregistrer les personnes de passage
- Offre pour les entreprises : partage d’un solde d’heures entre plusieurs personnes
