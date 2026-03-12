const fs = require('fs');
const html = fs.readFileSync('public/wholesaler-dashboard.html', 'utf8');
const lines = html.split('\n');

let inMainContent = false;
let depth = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track entering main-content
    if (line.includes('class="main-content"')) {
        inMainContent = true;
        depth = 0;
        console.log(`Line ${i+1}: ENTERED main-content`);
    }
    
    // Track section divs
    if (line.match(/id="[^"]*-section"/)) {
        const match = line.match(/id="([^"]*-section)"/);
        console.log(`Line ${i+1}: ${match[1]} | depth=${depth} | inMainContent=${inMainContent}`);
    }
    
    // Count div opens and closes to track when we exit main-content
    if (inMainContent) {
        const opens = (line.match(/<div/g) || []).length;
        const closes = (line.match(/<\/div>/g) || []).length;
        depth += opens - closes;
        
        if (depth <= 0 && inMainContent && i > 819) {
            console.log(`Line ${i+1}: EXITED main-content (depth dropped to ${depth})`);
            inMainContent = false;
        }
    }
}
