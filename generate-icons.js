const fs = require('fs');
const path = require('path');

// A simple 1x1 transparent PNG base64
const transparentPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// We'll just write this for now so the build doesn't fail, but ideally we'd want real icons
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), Buffer.from(transparentPng, 'base64'));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), Buffer.from(transparentPng, 'base64'));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), Buffer.from(transparentPng, 'base64'));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), Buffer.from(transparentPng, 'base64'));
fs.writeFileSync(path.join(publicDir, 'masked-icon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#5c3d2e"/></svg>');

console.log("Icons generated.");
