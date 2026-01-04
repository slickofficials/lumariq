const fs = require('fs');

const masterPath = 'docs/FUNCTIONS_MASTER.md';
const externalPath = 'docs/EXTERNAL_FUNCTIONS.txt';
const outPath = 'docs/GAPS_BACKLOG.md';

if (!fs.existsSync(masterPath)) { console.error('❌ Missing docs/FUNCTIONS_MASTER.md'); process.exit(1); }
if (!fs.existsSync(externalPath)) fs.writeFileSync(externalPath, '', 'utf8');

const master = fs.readFileSync(masterPath,'utf8')
  .split('\n')
  .filter(l => /^\d+\.\s+/.test(l))
  .map(l => l.replace(/^\d+\.\s+/, '').trim().toLowerCase());

const external = fs.readFileSync(externalPath,'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(Boolean)
  .map(l => l.replace(/^\d+[\.\)]\s+/, '').trim().toLowerCase());

const masterSet = new Set(master);
const gaps = [];
for (const e of external) if (!masterSet.has(e)) gaps.push(e);

const md = `# GAPS BACKLOG\n\nExternal count: ${external.length}\nMaster count: ${master.length}\nGaps: ${gaps.length}\n\n---\n\n` +
           gaps.map((g,i)=>`${i+1}. ${g}`).join('\n') + '\n';

fs.writeFileSync(outPath, md, 'utf8');
console.log(`✅ GAPS_BACKLOG.md generated: ${gaps.length} candidates`);
