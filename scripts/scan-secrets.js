// Simple local secret scanner - looks for common secret patterns
// Usage: node scripts/scan-secrets.js
const fs = require('fs');
const path = require('path');
const repoRoot = path.resolve(__dirname, '..');
const jwtPattern = /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g;
const serviceSecretPattern = /SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY|PRIVATE_KEY/gi;
function walk(dir) {
  const files = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (['.git', 'node_modules', '.next'].includes(name)) continue;
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}
const files = walk(repoRoot);
let found = false;
for (const f of files) {
  try {
    const txt = fs.readFileSync(f, 'utf8');
    const jwt = txt.match(jwtPattern);
    const serv = txt.match(serviceSecretPattern);
    if (jwt || serv) {
      console.log(`--- ${f}`);
      if (jwt) console.log('  JWT-like tokens:', jwt.slice(0,3));
      if (serv) console.log('  secret names:', [...new Set(serv)]);
      found = true;
    }
  } catch (e) {}
}
if (!found) console.log('No obvious secrets found (quick scan)');
