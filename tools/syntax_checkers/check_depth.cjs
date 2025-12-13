const fs = require('fs');
const content = fs.readFileSync('src/i18n.ts', 'utf8');
const lines = content.split('\n');

let depth = 0;
let minDepth = 0;
let minLine = -1;

lines.forEach((line, index) => {
  const opens = (line.match(/{/g) || []).length;
  const closes = (line.match(/}/g) || []).length;
  depth += opens - closes;
  
  if (depth < minDepth || (depth < 0 && index < 500)) {
    minDepth = depth;
    minLine = index + 1;
    console.log(`Line ${index + 1}: depth=${depth} opens=${opens} closes=${closes} | ${line.trim().substring(0, 60)}`);
  }
});

console.log(`\nFinal depth: ${depth}`);
console.log(`Minimum depth: ${minDepth} at line ${minLine}`);
