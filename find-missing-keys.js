const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
const regex = /t\(['"]([^'"]+)['"]/g;
let keys = new Set();
let fileMapping = {};

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
    if (!fileMapping[match[1]]) fileMapping[match[1]] = [];
    if (!fileMapping[match[1]].includes(f)) fileMapping[match[1]].push(f);
  }
});

const en = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'));

let missing = [];
keys.forEach(k => {
  const parts = k.split('.');
  let obj = en;
  let found = true;
  for (let p of parts) {
    if (obj[p] === undefined) {
      found = false;
      break;
    }
    obj = obj[p];
  }
  if (!found) {
    missing.push({key: k, files: fileMapping[k]});
  }
});
console.log('Missing keys in en.json:', JSON.stringify(missing, null, 2));
