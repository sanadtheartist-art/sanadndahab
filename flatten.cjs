const fs = require('fs');
let css = fs.readFileSync('src/admin.css', 'utf8');

css = css.replace(/--shadow:.*?;/g, '--shadow: none;');

// Simplify project card
css = css.replace(/\.project-card\s*\{([^}]*)\}/g, (match, inner) => {
    return '.project-card {' + inner.replace(/background: linear-gradient[^;]+;/, 'background: var(--surface);') + '}';
});
css = css.replace(/\.project-card:hover\s*\{([^}]*)\}/g, '.project-card:hover { border-color: rgba(255, 255, 255, 0.16); }');

// Simplify dash card
css = css.replace(/\.dash-card\s*\{([^}]*)\}/g, (match, inner) => {
    let replaced = inner.replace(/background: linear-gradient[^;]+;/, 'background: var(--surface);');
    replaced = replaced.replace(/box-shadow:[^;]+;/, 'box-shadow: none;');
    return '.dash-card {' + replaced + '}';
});
css = css.replace(/\.dash-card::before\s*\{[^}]*\}/g, '');
css = css.replace(/\.dash-card:hover\s*\{([^}]*)\}/g, '.dash-card:hover { border-color: rgba(255, 255, 255, 0.16); }');

// Simplify auth box
css = css.replace(/\.auth-box::before\s*\{[^}]*\}/g, '');
css = css.replace(/background:\s*linear-gradient[^;]+,\s*linear-gradient[^;]+,\s*var\(--bg\);/g, 'background: var(--bg);');

// Simplify buttons
css = css.replace(/\.btn-primary\s*\{([^}]*)\}/g, (match, inner) => {
    let r = inner.replace(/background: linear-gradient[^;]+;/, 'background: var(--accent);');
    r = r.replace(/box-shadow:[^;]+;/, '');
    return '.btn-primary {' + r + '}';
});
css = css.replace(/\.btn-primary:hover\s*\{([^}]*)\}/g, '.btn-primary:hover { background: var(--accent-hover); }');

css = css.replace(/\.btn:hover\s*\{([^}]*)\}/g, (match, inner) => {
    return '.btn:hover {' + inner.replace(/transform:[^;]+;/, '') + '}';
});

// Remove shadows from modals and panels
css = css.replace(/box-shadow:\s*var\(--shadow\);/g, '');
css = css.replace(/box-shadow:\s*0 [^;]+;/g, (match) => {
    if (match.includes('inset')) return match;
    return 'box-shadow: none;';
});

// Remove generic hover transforms that make things float
css = css.replace(/transform:\s*translateY\([^)]+\);/g, '/* removed transform */');

fs.writeFileSync('src/admin.css', css);
console.log('admin.css flattened');
