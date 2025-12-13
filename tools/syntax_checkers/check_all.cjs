const fs = require('fs');
const content = fs.readFileSync('src/i18n.ts', 'utf8');
const lines = content.split('\n');

let depth = 0;

lines.forEach((line, index) => {
  const opens = (line.match(/{/g) || []).length;
  const closes = (line.match(/}/g) || []).length;
  depth += opens - closes;
  
  if (index >= lines.length - 50 || line.includes('statistics:') || (depth <= 3 && index > 400)) {
    console.log(`${String(index + 1).padStart(4, ' ')}: depth=${depth} | ${line.trim().substring(0, 70)}`);
  }
});

console.log(`\nFinal depth: ${depth}`);
