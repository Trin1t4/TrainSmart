/**
 * PWA Icon Generator
 * Generates all required PWA icons from the source SVG
 *
 * Run: node scripts/generate-icons.js
 * Requires: sharp (npm install sharp)
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not installed. Creating placeholder icons...');
  sharp = null;
}

const ICONS_DIR = path.join(__dirname, '../public/icons');
const SPLASH_DIR = path.join(__dirname, '../public/splash');
const SVG_SOURCE = path.join(ICONS_DIR, 'icon.svg');

// Icon sizes needed for PWA
const ICON_SIZES = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
];

// Apple touch icon
const APPLE_TOUCH_SIZE = 180;

// Splash screen sizes for iOS (complete list for all modern devices)
const SPLASH_SIZES = [
  // iPhone 16 Pro Max
  { width: 1320, height: 2868, name: 'apple-splash-1320-2868.png' },
  // iPhone 16 Pro
  { width: 1206, height: 2622, name: 'apple-splash-1206-2622.png' },
  // iPhone 16 Plus, 15 Plus
  { width: 1290, height: 2796, name: 'apple-splash-1290-2796.png' },
  // iPhone 16, 15, 14 Pro
  { width: 1179, height: 2556, name: 'apple-splash-1179-2556.png' },
  // iPhone 14 Pro Max
  { width: 1290, height: 2796, name: 'apple-splash-1290-2796.png' },
  // iPhone 14 Plus, 13 Pro Max, 12 Pro Max
  { width: 1284, height: 2778, name: 'apple-splash-1284-2778.png' },
  // iPhone 14, 13, 13 Pro, 12, 12 Pro
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532.png' },
  // iPhone 13 Mini, 12 Mini, 11 Pro, XS, X
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' },
  // iPhone 11 Pro Max, XS Max
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688.png' },
  // iPhone 11, XR
  { width: 828, height: 1792, name: 'apple-splash-828-1792.png' },
  // iPad Pro 12.9"
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' },
  // iPad Pro 11"
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388.png' },
  // iPad Air, iPad Pro 10.5"
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048.png' },
];

// Create a simple PNG placeholder (1x1 pixel expanded)
function createPlaceholderPNG(width, height) {
  // PNG header for a simple colored image
  // This creates a minimal valid PNG
  const backgroundColor = { r: 16, g: 185, b: 129 }; // emerald-500

  // For simplicity, we'll create a minimal PNG structure
  // This is a workaround when sharp is not available
  return Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    // ... simplified - we'll use a different approach
  ]);
}

async function generateIcons() {
  // Ensure directories exist
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }
  if (!fs.existsSync(SPLASH_DIR)) {
    fs.mkdirSync(SPLASH_DIR, { recursive: true });
  }

  if (!sharp) {
    console.log('\n⚠️  Sharp is not installed.');
    console.log('To generate real PNG icons, run:');
    console.log('  npm install sharp');
    console.log('  node scripts/generate-icons.js\n');
    console.log('For now, the SVG icon will be used as fallback.\n');

    // Create a simple HTML file that can generate the icons in browser
    const generatorHTML = `<!DOCTYPE html>
<html>
<head>
  <title>PWA Icon Generator</title>
  <style>
    body { font-family: system-ui; padding: 20px; background: #1e293b; color: white; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px; }
    .icon-card { background: #334155; padding: 15px; border-radius: 12px; text-align: center; }
    canvas { background: #0f172a; border-radius: 8px; }
    button { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin: 5px; }
    button:hover { background: #059669; }
    h1 { color: #10b981; }
  </style>
</head>
<body>
  <h1>PWA Icon Generator</h1>
  <p>Click on each icon to download, or use "Download All" to get all icons at once.</p>
  <button onclick="downloadAll()">Download All Icons</button>
  <div class="grid" id="icons"></div>

  <script>
    const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
    const container = document.getElementById('icons');

    function drawIcon(ctx, size) {
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(1, '#059669');

      // Rounded rect background
      const radius = size * 0.1875; // 96/512 ratio
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, radius);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Scale factor
      const s = size / 512;

      ctx.fillStyle = 'white';

      // Left weight
      ctx.beginPath();
      ctx.roundRect(100*s, 180*s, 40*s, 152*s, 8*s);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(80*s, 210*s, 80*s, 92*s, 12*s);
      ctx.fill();

      // Bar
      ctx.beginPath();
      ctx.roundRect(160*s, 236*s, 192*s, 40*s, 8*s);
      ctx.fill();

      // Right weight
      ctx.beginPath();
      ctx.roundRect(372*s, 180*s, 40*s, 152*s, 8*s);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(352*s, 210*s, 80*s, 92*s, 12*s);
      ctx.fill();

      // Pulse line
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 12 * s;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(140*s, 380*s);
      ctx.lineTo(200*s, 380*s);
      ctx.lineTo(220*s, 340*s);
      ctx.lineTo(250*s, 420*s);
      ctx.lineTo(280*s, 360*s);
      ctx.lineTo(310*s, 380*s);
      ctx.lineTo(372*s, 380*s);
      ctx.stroke();
    }

    sizes.forEach(size => {
      const card = document.createElement('div');
      card.className = 'icon-card';

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = Math.min(size, 128) + 'px';
      canvas.style.height = Math.min(size, 128) + 'px';

      const ctx = canvas.getContext('2d');
      drawIcon(ctx, size);

      const label = document.createElement('p');
      label.textContent = size + 'x' + size;

      const btn = document.createElement('button');
      btn.textContent = 'Download';
      btn.onclick = () => downloadIcon(canvas, size);

      card.appendChild(canvas);
      card.appendChild(label);
      card.appendChild(btn);
      container.appendChild(card);
    });

    function downloadIcon(canvas, size) {
      const link = document.createElement('a');
      link.download = 'icon-' + size + 'x' + size + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }

    function downloadAll() {
      document.querySelectorAll('canvas').forEach((canvas, i) => {
        setTimeout(() => {
          downloadIcon(canvas, sizes[i]);
        }, i * 200);
      });
    }
  </script>
</body>
</html>`;

    fs.writeFileSync(path.join(ICONS_DIR, 'generate.html'), generatorHTML);
    console.log('Created: icons/generate.html');
    console.log('Open this file in a browser to generate and download PNG icons.\n');
    return;
  }

  // If sharp is available, generate all icons
  const svgBuffer = fs.readFileSync(SVG_SOURCE);

  console.log('Generating PWA icons...\n');

  // Generate standard icons
  for (const size of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Created: icon-${size}x${size}.png`);
  }

  // Generate Apple touch icon
  const appleTouchPath = path.join(ICONS_DIR, 'apple-touch-icon.png');
  await sharp(svgBuffer)
    .resize(APPLE_TOUCH_SIZE, APPLE_TOUCH_SIZE)
    .png()
    .toFile(appleTouchPath);
  console.log(`✓ Created: apple-touch-icon.png`);

  // Generate favicon sizes
  const favicon32 = path.join(ICONS_DIR, 'favicon-32x32.png');
  const favicon16 = path.join(ICONS_DIR, 'favicon-16x16.png');
  await sharp(svgBuffer).resize(32, 32).png().toFile(favicon32);
  await sharp(svgBuffer).resize(16, 16).png().toFile(favicon16);
  console.log(`✓ Created: favicon-32x32.png`);
  console.log(`✓ Created: favicon-16x16.png`);

  // Generate badge icon
  const badge72 = path.join(ICONS_DIR, 'badge-72x72.png');
  await sharp(svgBuffer).resize(72, 72).png().toFile(badge72);
  console.log(`✓ Created: badge-72x72.png`);

  // Generate splash screens
  console.log('\nGenerating splash screens...\n');
  for (const splash of SPLASH_SIZES) {
    const outputPath = path.join(SPLASH_DIR, splash.name);

    // Create splash with icon centered
    const iconSize = Math.min(splash.width, splash.height) * 0.3;
    const resizedIcon = await sharp(svgBuffer)
      .resize(Math.round(iconSize), Math.round(iconSize))
      .toBuffer();

    await sharp({
      create: {
        width: splash.width,
        height: splash.height,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 } // slate-900
      }
    })
    .composite([{
      input: resizedIcon,
      gravity: 'center'
    }])
    .png()
    .toFile(outputPath);

    console.log(`✓ Created: ${splash.name}`);
  }

  console.log('\n✅ All icons generated successfully!\n');
}

generateIcons().catch(console.error);
