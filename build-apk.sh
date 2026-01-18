#!/bin/bash
set -e  # Stoppe le script si une commande échoue

# =============================
# CONFIGURATION
# =============================
APP_NAME="mobile_carte"
APK_PATH="./app/build/outputs/apk/debug/app-debug.apk"
# =============================
# ÉTAPE 1 : Build Ionic
# =============================
echo "Étape 1 : Compilation Ionic..."
ionic build

# =============================
# ÉTAPE 2 : Sync Capacitor
# =============================
echo "Étape 2 : Synchronisation Capacitor..."
npx cap sync android

# =============================
# ÉTAPE 3 : Compilation Gradle
# =============================
echo "Étape 3 : Compilation Gradle (APK Debug)..."
cd android
./gradlew assembleDebug

# =============================
# ÉTAPE 4 : Installation via ADB
# =============================
echo "Étape 4 : Installation de l’APK sur l’appareil..."
if [ -f "$APK_PATH" ]; then
  adb devices
  echo "📦 Installation de $APK_PATH ..."
  adb install -r "$APK_PATH"
  echo "✅ Application installée avec succès !"
else
  echo "❌ APK introuvable à l’emplacement : $APK_PATH"
  echo "Vérifie que la compilation s’est bien terminée."
fi

# =============================
# ÉTAPE 5 : Retour au dossier racine
# =============================
cd ..
echo "🎉 Déploiement terminé pour $APP_NAME"
