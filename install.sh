#!/bin/bash
set -e

# TabRot 1-Line Installer for Linux & macOS
INSTALL_DIR="$HOME/.tabrot-extension"
RELEASE_URL="https://github.com/Ilyan321/TabRot/releases/latest/download/tabrot-extension-v1.0.0.zip"

echo "🪴 TabRot — The Digital Tab Terrarium & Graveyard"
echo "------------------------------------------------"
echo "📦 Downloading latest production build..."

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

if command -v curl >/dev/null 2>&1; then
  curl -sL "$RELEASE_URL" -o tabrot.zip
elif command -v wget >/dev/null 2>&1; then
  wget -q "$RELEASE_URL" -O tabrot.zip
else
  echo "❌ Neither curl nor wget found. Please install one of them."
  exit 1
fi

echo "📂 Extracting files to $INSTALL_DIR..."
unzip -q -o tabrot.zip
rm tabrot.zip

echo ""
echo "✅ TabRot extension successfully installed to: $INSTALL_DIR"
echo ""
echo "🚀 Final Step (10 seconds):"
echo "  1. In Google Chrome, go to: chrome://extensions"
echo "  2. Toggle on 'Developer mode' (top-right corner)"
echo "  3. Click 'Load unpacked' and select:"
echo "     $INSTALL_DIR"
echo ""
echo "Enjoy your living tab terrarium! 🪦✨"
