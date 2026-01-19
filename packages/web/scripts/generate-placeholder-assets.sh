#!/bin/bash
# generate-placeholder-assets.sh
# Genera icone e splash screen placeholder per testing
# Richiede ImageMagick: brew install imagemagick

set -e

ASSETS_DIR="./assets"
mkdir -p "$ASSETS_DIR"

# Colori TrainSmart
BG_COLOR="#0F172A"  # slate-900
PRIMARY="#10B981"   # emerald-500

echo "🎨 Generazione assets placeholder..."

# Icon (1024x1024)
echo "  📱 Creazione icon.png..."
convert -size 1024x1024 xc:"$BG_COLOR" \
  -fill "$PRIMARY" -draw "circle 512,512 512,256" \
  -fill white -gravity center -pointsize 400 -annotate 0 "TS" \
  "$ASSETS_DIR/icon.png"

# Icon Foreground (1024x1024 con padding per adaptive icon)
echo "  📱 Creazione icon-foreground.png..."
convert -size 1024x1024 xc:none \
  -fill "$PRIMARY" -draw "circle 512,512 512,300" \
  -fill white -gravity center -pointsize 350 -annotate 0 "TS" \
  "$ASSETS_DIR/icon-foreground.png"

# Icon Background (1024x1024 solid color)
echo "  📱 Creazione icon-background.png..."
convert -size 1024x1024 xc:"$BG_COLOR" "$ASSETS_DIR/icon-background.png"

# Splash Screen (2732x2732)
echo "  🖼️ Creazione splash.png..."
convert -size 2732x2732 xc:"$BG_COLOR" \
  -fill "$PRIMARY" -draw "circle 1366,1200 1366,944" \
  -fill white -gravity center -pointsize 500 -annotate +0-200 "TS" \
  -fill "#94A3B8" -gravity center -pointsize 80 -annotate +0+300 "TrainSmart" \
  "$ASSETS_DIR/splash.png"

# Splash Dark (same as regular for dark theme)
echo "  🖼️ Creazione splash-dark.png..."
cp "$ASSETS_DIR/splash.png" "$ASSETS_DIR/splash-dark.png"

# Notification Icon (96x96, white on transparent)
echo "  🔔 Creazione notification-icon.png..."
convert -size 96x96 xc:none \
  -fill white -draw "circle 48,48 48,16" \
  -fill "$BG_COLOR" -gravity center -pointsize 50 -annotate 0 "T" \
  "$ASSETS_DIR/notification-icon.png"

echo ""
echo "✅ Assets placeholder generati in $ASSETS_DIR/"
echo ""
echo "⚠️  NOTA: Questi sono placeholder!"
echo "   Sostituiscili con le icone finali prima del rilascio."
echo ""
echo "📋 File generati:"
ls -la "$ASSETS_DIR/"
echo ""
echo "🚀 Ora puoi eseguire:"
echo "   npm run assets:generate"
