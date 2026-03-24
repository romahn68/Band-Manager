const fs = require('fs');

function cleanImport(filePath, removeList) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    removeList.forEach(w => {
        let regex = new RegExp(`\\b${w}\\b\\s*,?\\s*`, 'g');
        content = content.replace(regex, '');
    });
    
    // Clean up empty braces like import { } from '...'
    content = content.replace(/import\\s*\\{\\s*\\}\\s*from\\s*['"][^'"]+['"];?/g, '');
    // Clean up comma before brace like import { , foo }
    content = content.replace(/\\{\\s*,/g, '{');
    // Clean up comma before brace end like import { foo, }
    content = content.replace(/,\\s*\\}/g, '}');

    // Specifically for AdminDashboard.jsx
    if (filePath.includes('AdminDashboard.jsx')) {
        content = content.replace(/const \\{ activeBand, userParams, ghostMode, exitGhostMode \\} = useApp\\(\\);/g, 'const { activeBand, userParams } = useApp();');
    }

    fs.writeFileSync(filePath, content);
}

cleanImport('src/App.jsx', ['useState']);
cleanImport('src/AppContext.jsx', ['collection', 'query', 'where', 'getDocs', 'deleteDoc']);
cleanImport('src/AuthContext.jsx', ['setDoc']);
cleanImport('src/components/LoadingScreen.jsx', ['motion']);
cleanImport('src/components/SkeletonLoader.jsx', ['motion']);
cleanImport('src/features/songs/ChordProViewer.jsx', ['useEffect']);
cleanImport('src/features/songs/Songs.jsx', ['motion']);
cleanImport('src/pages/AdminDashboard.jsx', ['motion', 'ghostMode', 'exitGhostMode']);
cleanImport('src/pages/Dashboard.jsx', ['motion']);
cleanImport('src/pages/Finances.jsx', ['motion']);

console.log('Linter fix applied.');
