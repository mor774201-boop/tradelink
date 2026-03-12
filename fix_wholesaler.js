const fs = require('fs');
const path = 'c:\\Users\\cairo\\Desktop\\tradelink\\public\\wholesaler-dashboard.html';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: lai() closing
content = content.replace(/lai\(\) \{[\s\S]*?\}\.join\(''\);/g, (match) => {
    if (match.includes("setHTML('ai-recs-grid'")) {
        return match.replace("}).join('');", "}).join(''));");
    }
    return match;
});

// Fix 2: rsp() closing
content = content.replace(/setHTML\('spg', p\.length \? p\.map[\s\S]*?\}\)\.join\(''\) : '.*';/g, (match) => {
    return match.replace("'; ", "');");
});

// Fix 3: opm() closing
content = content.replace(/setHTML\('sopi', `[\s\S]*?`;/g, (match) => {
    return match.replace("`;", "`);");
});

// Fix 4: sim-prods closing
content = content.replace(/setHTML\('sim-prods', sim\.length \? sim\.map[\s\S]*?\}\)\.join\(''\) : '.*';/g, (match) => {
    return match.replace("'; ", "');");
});

// Generic fix for setHTML calls that forgot to close with )
// We look for setHTML('something', ... ; and check if it needs a )
// This is risky but let's try to be specific.

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed syntax errors');
