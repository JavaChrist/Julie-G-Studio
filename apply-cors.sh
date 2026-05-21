#!/usr/bin/env bash
# Applique la configuration CORS au bucket Firebase Storage du projet Julie-G Studio.
# Usage: ./apply-cors.sh  (depuis Git Bash)
#
# Pré-requis:
#   - Google Cloud SDK installé (déjà OK)
#   - gsutil disponible dans le PATH (déjà OK)
#   - Authentifié avec le compte propriétaire du projet (gcloud auth list)

set -e

BUCKET="gs://julie-g-studio-e7173.firebasestorage.app"
CORS_FILE="cors.json"

# Le gsutil bundlé exige Python 3.8-3.12, et Python 3.13 est le seul installé sur ce
# système. On utilise donc le Python embarqué dans le Cloud SDK (3.12).
export CLOUDSDK_PYTHON='C:\Users\conta\AppData\Local\Google\Cloud SDK\google-cloud-sdk\platform\bundledpython\python.exe'

if [ ! -f "$CORS_FILE" ]; then
  echo "ERREUR: $CORS_FILE introuvable dans le dossier courant."
  echo "Lance ce script depuis la racine du projet Julie-G-Studio."
  exit 1
fi

echo "→ Compte gcloud actif:"
gcloud auth list --filter=status:ACTIVE --format="value(account)"
echo ""

echo "→ Application de la configuration CORS sur $BUCKET ..."
gsutil cors set "$CORS_FILE" "$BUCKET"
echo ""

echo "→ Vérification:"
gsutil cors get "$BUCKET"
echo ""
echo "✓ Terminé. Recharge ton onglet du navigateur (Ctrl+Shift+R) et retente l'upload."
