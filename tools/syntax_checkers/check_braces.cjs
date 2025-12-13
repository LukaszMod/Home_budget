const fs = require('fs');
const content = fs.readFileSync('src/i18n.ts', 'utf8');
const lines = content.split('\n');

let stack = [];
let depth = 0;

lines.forEach((line, index) => {
  for (let char of line) {
    if (char === '{') {
      depth++;
      stack.push({ line: index + 1, depth });
    } else if (char === '}') {
      if (stack.length === 0) {
        console.log(`ERROR: Extra closing brace at line ${index + 1}`);
      } else {
        stack.pop();
      }
      depth--;
    }
  }
});

if (stack.length > 0) {
  console.log(`ERROR: Missing ${stack.length} closing braces`);
  console.log('Unclosed braces at lines:');
  stack.forEach(item => console.log(`  Line ${item.line} (depth ${item.depth})`));
} else {
  console.log('All braces matched!');
}
