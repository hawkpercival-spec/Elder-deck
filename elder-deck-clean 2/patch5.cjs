const fs = require('fs');
let content = fs.readFileSync('src/components/JoinTheBand.tsx', 'utf-8');

content = content.replace('useState("Sovereign of Reanimated Souls");', 'useState("");');

fs.writeFileSync('src/components/JoinTheBand.tsx', content);
