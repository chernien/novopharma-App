<div align="center">

<img src="src/assets/logo_NOVOPHARMA_H-1-mini.png" alt="Novopharma" width="280"/>

# Novopharma MSL — Application Mobile Force de Vente

**Application mobile hybride de gestion de la force de vente terrain pour délégués commerciaux et visiteurs médicaux du secteur pharmaceutique & dermo-cosmétique.**

[![Ionic](https://img.shields.io/badge/Ionic-8-3880FF?logo=ionic&logoColor=white)](https://ionicframework.com/)
[![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20PWA-success)](#)

</div>

---

## 📑 Sommaire

- [Présentation](#-présentation)
- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies utilisées](#-technologies-utilisées)
- [Captures d'écran](#-captures-décran)
- [Structure du projet](#-structure-du-projet)
- [Installation](#-installation)
- [Build & déploiement mobile](#-build--déploiement-mobile)
- [Responsive & expérience mobile](#-responsive--expérience-mobile)
- [Points techniques intéressants](#-points-techniques-intéressants)
- [Auteur](#-auteur)

---

## 🎯 Présentation

**Novopharma MSL** (*Mobile Sales Loop*) est une application mobile destinée aux **délégués commerciaux et visiteurs médicaux** d'un laboratoire pharmaceutique. Elle équipe les commerciaux sur le terrain pour gérer l'intégralité de leur **tournée de visites** : pointage géolocalisé chez les pharmacies, prise de commande produit par produit, attribution de cadeaux promotionnels, consultation de l'historique des factures, et synchronisation des données — y compris **en l'absence de connexion réseau**.

| | |
|---|---|
| **Objectif** | Digitaliser et fiabiliser la tournée commerciale terrain (visites, commandes, reporting). |
| **Public cible** | Délégués commerciaux, visiteurs médicaux, force de vente B2B pharmaceutique. |
| **Contexte d'usage** | Mobilité totale, conditions réseau instables, saisie rapide en pharmacie. |
| **Backend** | API REST consommée sur `https://novopharma.tn`. |

---

## 👀 Aperçu

L'application s'articule autour d'une **navigation par onglets** pensée pour le terrain. Après authentification, le commercial accède à 5 espaces de travail :

| Onglet | Rôle |
|--------|------|
| 🏥 **Pharmacie** | Liste et recherche des pharmacies (clients), pointage **check-in / check-out géolocalisé** des visites. |
| 📋 **Articles** | Catalogue produits organisé par **marque** et par **dermo**, recherche, fiche article, scan code-barres. |
| 🎁 **Gift** | Attribution de cadeaux et échantillons promotionnels associés aux gammes. |
| 🛒 **Panier** | Construction de la commande, gestion des quantités, lots, n° de série et dates de péremption. |
| 📅 **Journée** | Récapitulatif de la tournée du jour, validation et **envoi des commandes** (avec reprise hors-ligne). |

---

## ✨ Fonctionnalités

### 🔐 Authentification & sessions
- Connexion commercial sécurisée via formulaire réactif (validation Angular `Reactive Forms`).
- Persistance de session (`localStorage`) avec redirection automatique si déjà connecté.
- Déconnexion avec nettoyage complet de la session.

### 📍 Visites terrain (géolocalisation)
- **Check-in / Check-out** des visites en pharmacie avec capture de la **géolocalisation** (Capacitor Geolocation).
- Horodatage des entrées/sorties pour le reporting d'activité.

### 🛒 Prise de commande
- Catalogue produits par **marque** et **dermo**, recherche temps réel via pipes dédiés.
- Panier réactif persistant avec gestion fine : quantités, **quantité vendue**, **numéros de série** et **dates de péremption multiples** (jusqu'à 3 lots par ligne).
- Commande mono-pharmacie ou **multi-pharmacies** (envoi groupé).

### 🎁 Cadeaux & promotions
- Sélection et commande de **gifts / échantillons** rattachés à une dermo ou un produit.

### 📷 Saisie assistée
- **Scan de code-barres** produit (`@zxing/browser` + `capacitor-barcode-scanner`).
- **Reconnaissance optique (OCR)** via `tesseract.js` pour la lecture de références.
- Capture photo (Capacitor Camera) pour pièces justificatives / factures.

### 🧾 Historique & documents
- Consultation des **factures** et **en-têtes de commandes** par client.
- Filtres par **mois** et **trimestre**.
- Détail des lignes de commande/facture.

### 🌐 Mode hors-ligne (offline-first)
- Détection en temps réel de l'état réseau (`NetworkService`, `BehaviorSubject`).
- **File d'attente de synchronisation par chunks** (`CommandeQueueService`) : les commandes sont découpées, persistées localement, envoyées progressivement, et **toute session incomplète est reprise automatiquement** au retour de la connexion.

---

## 🛠 Technologies utilisées

| Technologie | Usage |
|-------------|-------|
| **Ionic 8** | Framework UI mobile (composants natifs, navigation, theming) |
| **Angular 19** | Framework applicatif (modules, lazy-loading, services, routing) |
| **Capacitor 7** | Pont natif (Android), accès aux API device |
| **TypeScript 5.6** | Langage principal, typage statique |
| **RxJS 7.8** | Programmation réactive (état panier, état réseau) |
| **Capacitor Geolocation** | Pointage géolocalisé des visites |
| **Capacitor Camera / Filesystem** | Capture photo et stockage |
| **@zxing/browser · capacitor-barcode-scanner** | Lecture de codes-barres |
| **tesseract.js** | OCR de références produit |
| **ngx-infinite-scroll** | Défilement infini sur les listes longues |
| **Ionicons** | Jeu d'icônes |
| **ESLint · Karma / Jasmine** | Qualité de code et tests unitaires |

---

## 🖼 Captures d'écran

> 📸 *Insérer ici les captures de l'application. Emplacements recommandés ci-dessous.*

| Écran | Emplacement de la capture |
|-------|---------------------------|
| **Authentification** | `docs/screenshots/01-login.png` |
| **Liste des pharmacies + Check-in** | `docs/screenshots/02-pharmacies.png` |
| **Catalogue par marque / articles** | `docs/screenshots/03-articles.png` |
| **Fiche article & scan code-barres** | `docs/screenshots/04-scan.png` |
| **Panier (lots / quantités)** | `docs/screenshots/05-cart.png` |
| **Journée / validation des commandes** | `docs/screenshots/06-journee.png` |
| **Gifts & promotions** | `docs/screenshots/07-gifts.png` |
| **Factures & historique** | `docs/screenshots/08-factures.png` |

<!--
Exemple d'intégration une fois les images ajoutées :

<p align="center">
  <img src="docs/screenshots/01-login.png" width="220"/>
  <img src="docs/screenshots/02-pharmacies.png" width="220"/>
  <img src="docs/screenshots/05-cart.png" width="220"/>
</p>
-->

---

## 📂 Structure du projet

```
novopharma/
├── src/
│   ├── app/
│   │   ├── login/                 # Authentification commercial
│   │   ├── tabs/                  # Conteneur de navigation (5 onglets)
│   │   ├── pharamcie/             # Pharmacies (clients) + check-in/out géolocalisé
│   │   ├── marque/                # Catalogue par marque
│   │   ├── dermos/                # Catalogue par dermo
│   │   ├── articles/              # Liste & fiche produit, scan
│   │   ├── gift/                  # Cadeaux & échantillons
│   │   ├── cart/                  # Panier
│   │   ├── commande-pharmacie/    # « Journée » : validation/envoi des commandes
│   │   ├── recommande/            # Produits recommandés
│   │   ├── facture/               # Factures & historiques
│   │   ├── components/            # Composants réutilisables (ex. fact)
│   │   ├── pipes/                 # Filtres de recherche (article, client, commande, gift…)
│   │   ├── services/              # Logique métier & accès API
│   │   │   ├── client.service.ts          # Auth, check-in/out, commandes
│   │   │   ├── articles.service.ts         # Articles, marques, factures
│   │   │   ├── cart.service.ts             # État du panier (RxJS + localStorage)
│   │   │   ├── commande-queue.service.ts   # File offline par chunks
│   │   │   ├── network.service.ts          # Détection online/offline
│   │   │   ├── photo.service.ts            # Upload factures/photos
│   │   │   └── ...
│   │   ├── app-routing.module.ts  # Routing global (lazy-loading + preload)
│   │   └── app.module.ts
│   ├── assets/                    # Logos, images, polices, icônes
│   ├── environments/              # Configuration (URL backend)
│   ├── theme/                     # Variables de thème Ionic
│   └── global.scss
├── android/                       # Projet natif Android (Capacitor)
├── resources/                     # Icônes & splash screens
├── capacitor.config.ts            # Configuration Capacitor (appId: com.novo.app)
├── angular.json
└── package.json
```

---

## 🚀 Installation

### Prérequis

| Outil | Version recommandée |
|-------|---------------------|
| **Node.js** | ≥ 18 LTS |
| **npm** | ≥ 9 |
| **Ionic CLI** | `npm i -g @ionic/cli` |
| **Android Studio** | Pour le build natif Android (optionnel) |

### Installation des dépendances

```bash
# Cloner le dépôt
git clone https://github.com/chernien/novopharma-App.git
cd novopharma-App

# Installer les dépendances
npm install
```

### Lancement en développement

```bash
# Serveur de développement (http://localhost:4200)
npm start

# ou avec live-reload Ionic
ionic serve
```

### Build de production

```bash
npm run build
```

Les fichiers compilés sont générés dans le dossier `www/`.

### Tests & qualité

```bash
npm test        # Tests unitaires (Karma / Jasmine)
npm run lint    # Analyse statique (ESLint)
```

---

## 📱 Build & déploiement mobile

```bash
# Construire le bundle web
npm run build

# Synchroniser avec le projet natif
npx cap sync android

# Ouvrir dans Android Studio
npx cap open android
```

> ⚙️ Configuration native : `appId = com.novo.app`, `appName = MSL` (voir `capacitor.config.ts`).
> Le backend ciblé est défini dans `src/environments/environment.ts`.

---

## 📐 Responsive & expérience mobile

- **Mobile-first** : interface construite avec les composants adaptatifs Ionic (`ion-grid`, `ion-content`, safe-areas).
- **Navigation par onglets** fixe en bas d'écran — ergonomie pouce-friendly pour usage à une main sur le terrain.
- **PWA-ready** grâce à `@ionic/pwa-elements`, exploitable aussi sur navigateur.
- **Gestion du clavier et de la status bar** native (Capacitor Keyboard / StatusBar) pour éviter les chevauchements d'UI.
- **Listes performantes** sur gros volumes via défilement infini (`ngx-infinite-scroll`).

---

## 💡 Points techniques intéressants

> Cette section met en lumière les choix d'ingénierie qui distinguent le projet.

### 🧩 Architecture
- **Lazy-loading systématique** des pages via `loadChildren` + `PreloadAllModules` → démarrage rapide, chargement à la demande.
- Séparation nette **pages / composants / pipes / services**, logique métier isolée dans la couche service.

### 🌐 Résilience réseau (offline-first)
- `CommandeQueueService` implémente une **file de synchronisation par chunks** : chaque lot de commande est persisté avant envoi, marqué individuellement comme envoyé, et **les sessions interrompues sont reprises automatiquement** — aucune commande perdue malgré une coupure réseau.
- `NetworkService` expose l'état de connexion en flux réactif et fournit une primitive `waitForOnline()`.

### ⚡ Gestion d'état réactive
- Le panier est piloté par un **`BehaviorSubject` RxJS** avec persistance `localStorage` : tout composant abonné est notifié en temps réel des changements.

### 📷 Capacités device natives
- Intégration de la **géolocalisation**, de la **caméra**, du **scan code-barres** et de l'**OCR** (tesseract.js) directement dans le parcours de saisie.

### 🔍 Recherche & filtrage
- **Pipes Angular dédiés** (article, client, commande, gift, recommande) pour un filtrage déclaratif et réutilisable des listes.

### 🧪 Qualité
- Configuration **ESLint** (Angular ESLint + TypeScript ESLint) et **tests unitaires** Karma/Jasmine en place.

---

## 👤 Auteur



| **LinkedIn** | _[https://linkedin.com/in/votre-profil](https://www.linkedin.com/in/amine-cherni/)_ |


---

<div align="center">

*Développé avec Ionic, Angular & Capacitor.*

</div>
