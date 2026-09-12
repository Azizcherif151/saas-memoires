# EduSoutenance

SaaS de centralisation de la gestion des **mémoires de soutenance** pour les universités en Côte d'Ivoire.

## Fonctionnalités

- Multi-établissements (création par SuperAdmin)
- Rôles : SuperAdmin, Admin établissement, Étudiant, Encadreur, Jury
- Attribution des sujets et des encadreurs
- Éditeur de mémoire collaboratif (versions, corrections, export)
- Dépôt PDF sécurisé
- Planification des soutenances (salles + jury)
- Notation et suivi de validation

## Stack

- **Frontend / Backend** : Next.js (App Router), React, TypeScript
- **UI** : Tailwind CSS v4
- **Auth** : JWT (`jose`) + cookies HttpOnly
- **Base de données** : PostgreSQL (`pg`)
- **Sécurité** : bcryptjs

## Prérequis

- Node.js 20+
- PostgreSQL
- Variables d'environnement (voir `.env.example`)

