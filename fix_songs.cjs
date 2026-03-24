const fs = require('fs');
let c = fs.readFileSync('src/features/songs/Songs.jsx', 'utf8');
c = c.replace(/<\.div/g, '<motion.div');
c = c.replace(/<\/\.div/g, '</motion.div');
c = c.replace(/<\.form/g, '<motion.form');
c = c.replace(/<\/\.form/g, '</motion.form');
c = c.replace(/'framer-';/, "'framer-motion';");
fs.writeFileSync('src/features/songs/Songs.jsx', c);
console.log('Songs.jsx repaired.');
