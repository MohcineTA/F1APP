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

## 📦 Mises à Jour & Test sur Expo Go

Avant de publier vos modifications pour tout le monde, vous les testez généralement en local via l'application **Expo Go**.

**⚠️ Problèmes d'affichage sur Expo Go ? (Images manquantes, code non pris en compte...)**
Si vous ajoutez de nouvelles images ou de gros changements mais qu'ils ne s'affichent pas sur votre téléphone, c'est un problème de cache.
1. Fermez l'application Expo Go sur votre téléphone.
2. Interrompez le serveur dans votre terminal (`Ctrl + C`).
3. Relancez en vidant le cache avec la commande :
   ```bash
   npx expo start -c
   ```
4. Au besoin, si le téléphone ne trouve pas le serveur sur votre réseau Wi-Fi local, utilisez le mode tunnel :
   ```bash
   npx expo start --tunnel
   ```

## 🚀 Publier une nouvelle version en Production (OTA)

Afin de simplifier le processus de mise en ligne des nouvelles modifications pour **tous vos utilisateurs finaux**, un script automatisé a été mis en place.

**Comment procéder ?**
1. Ouvrez un terminal PowerShell `(Terminal -> Nouveau Terminal` dans VS Code).
2. Exécutez la commande suivante :
   ```powershell
   .\deploy.ps1
   ```
3. L'outil vous demandera un message décrivant la mise à jour (ex: `Ajout du logo F1`). Saisissez-le et validez avec Entrée.

**Actions réalisées automatiquement par le script :**
- 💾 Sauvegarde locale de tous les fichiers modifiés (`git commit`).
- ☁️ Sauvegarde en ligne sécurisée et documentation sur ce dépôt GitHub (`git push`).
- ⚡ Déploiement Over-The-Air sur vos appareils cibles via Expo (`eas update`). Vos utilisateurs finaux auront la nouvelle version au prochain démarrage de l'application sans repasser par les App Stores.

## 🤝 Partage et Collaboration (GitHub)
Déposer le code sur **GitHub** (ce dépôt) est une excellente pratique :
1. **Sécurité et Historique** : Vous ne perdrez jamais votre code et gardez une trace de chaque version.
2. **Partage** : D'autres personnes / développeurs peuvent cloner le projet, voir l'architecture et l'installer localement plus facilement.
3. **Documentation** : Ce fichier `README.md` fait office de documentation d'accueil pour tout visiteur de votre projet.
