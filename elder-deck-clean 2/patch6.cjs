const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');
content = content.replace('accountHandle: accountHandle || "teleparty_seeker",', 'accountHandle: accountHandle || "Unknown",');
fs.writeFileSync('server.ts', content);
