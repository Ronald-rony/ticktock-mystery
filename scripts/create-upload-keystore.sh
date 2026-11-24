#!/usr/bin/env bash
set -euo pipefail

# Generates a Play Store Upload Keystore + android/keystore.properties
# Requires Java keytool (comes with OpenJDK 17+ or Android Studio).

KEYSTORE_PATH="android/app/ticktock-upload.jks"
PROPS_PATH="android/keystore.properties"
ALIAS="ticktock-upload"

if ! command -v keytool >/dev/null 2>&1 || ! keytool -help >/dev/null 2>&1; then
  echo "❌ Java keytool is not available yet. Install OpenJDK 17+ first:"
  echo "   brew install --cask temurin@21"
  exit 1
fi

if [ -f "$KEYSTORE_PATH" ]; then
  echo "⚠️  Keystore already exists at $KEYSTORE_PATH — delete it manually if you truly want a new one."
  exit 1
fi

read -rsp "Enter a strong Upload Keystore password (min 6 chars): " STORE_PASS
echo ""
read -rp "Enter your Name / Studio Name (e.g. Ronald Studio): " ORG_NAME

keytool -genkeypair -v \
  -keystore "$KEYSTORE_PATH" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias "$ALIAS" \
  -storepass "$STORE_PASS" \
  -keypass "$STORE_PASS" \
  -dname "CN=$ORG_NAME, OU=Games, O=$ORG_NAME, L=City, ST=State, C=US"

cat > "$PROPS_PATH" <<EOF
storeFile=ticktock-upload.jks
storePassword=$STORE_PASS
keyAlias=$ALIAS
keyPassword=$STORE_PASS
EOF

echo "✅ Created $KEYSTORE_PATH and $PROPS_PATH!"
echo "⚠️  BACK UP $KEYSTORE_PATH in a safe place (Google Drive / password manager). Do NOT commit it to Git."
