# 🏎️ F1 App

Une application mobile dédiée à la Formule 1, développée avec [React Native](https://reactnative.dev/) et [Expo](https://expo.dev/).

## 🌟 À Propos de l'Application
Cette application permet aux fans de suivre la saison de F1, avec toutes les informations nécessaires à portée de main (Classements, Courses, etc.). 
Elle inclut une version Web, iOS et Android construite depuis une base de code unique.

## 🛠️ Technologies Utilisées
- **Framework :** React Native 0.81 / Expo SDK 54
- **Navigation :** React Navigation v7 (Stack & Bottom Tabs)
- **Déploiement OTA :** EAS Update (Expo Application Services)

## 🚀 Installation & Lancement (Local)

1. **Cloner le projet** (si sur une nouvelle machine) :
   ```bash
   git clone https://github.com/MohcineTA/F1APP.git
   cd F1APP
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement** :
   ```bash
   npx expo start
   ```

Vous pouvez ensuite scanner le QR code avec l'application **Expo Go** sur votre téléphone ou appuyer sur `w` pour l'ouvrir dans le navigateur web.

## 📦 Mise à Jour et Déploiement (Push & OTA)

Afin de simplifier le processus de mise en ligne des nouvelles modifications, un script automatisé a été mis en place.

**Interface locale (Script de déploiement) :**
Lorsque vous modifiez l'application et souhaitez appliquer les changements instantanément :

1. Ouvrez un terminal PowerShell `(Terminal -> Nouveau Terminal` dans VS Code ou Cursor).
2. Exécutez la commande suivante :
   ```powershell
   .\deploy.ps1
   ```
3. L'outil vous demandera un message décrivant la mise à jour. Saisissez-le et validez avec Entrée.

**Actions réalisées automatiquement par le script :**
- 💾 Sauvegarde locale de tous les fichiers modifiés (`git commit`).
- ☁️ Sauvegarde en ligne sécurisée et documentation sur ce dépôt GitHub (`git push`).
- ⚡ Déploiement Over-The-Air sur vos appareils cibles via Expo (`eas update`). Vos utilisateurs finaux auront la nouvelle version au prochain démarrage de l'application sans repasser par les App Stores.

## 🤝 Partage et Collaboration (GitHub)
Déposer le code sur **GitHub** (ce dépôt) est une excellente pratique :
1. **Sécurité et Historique** : Vous ne perdrez jamais votre code et gardez une trace de chaque version.
2. **Partage** : D'autres personnes / développeurs peuvent cloner le projet, voir l'architecture et l'installer localement plus facilement.
3. **Documentation** : Ce fichier `README.md` fait office de documentation d'accueil pour tout visiteur de votre projet.
