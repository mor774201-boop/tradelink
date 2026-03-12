const fs = require('fs');
const path = 'c:\\Users\\cairo\\Desktop\\tradelink\\public\\wholesaler-dashboard.html';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: lai() closing (line 1682 area)
// We look for setHTML('ai-recs-grid', ... .join('');
content = content.replace(/(setHTML\('ai-recs-grid'[\s\S]*?\.join\(''\));/g, (match) => {
    if (match.endsWith("join(''))")) return match; // already fixed
    return match.replace(".join('');", ".join(''));");
});

// Double check opm() closing (line 1818 area)
// setHTML('sopi', `...` );
content = content.replace(/(setHTML\('sopi'[\s\S]*?` : ''\s*)\);/g, (match, p1) => {
    return p1 + '`);';
});

// Check for any other setHTML that might be missing )
// This matches setHTML(..., `...` ; and adds )
content = content.replace(/(setHTML\('[^']*'[\s\S]*?`)\s*;/g, (match, p1) => {
    if (match.includes('`);')) return match;
    return p1 + '`);';
});

fs.writeFileSync(path, content, 'utf8');
console.log('Wholesaler Dashboard JS hardened.');
