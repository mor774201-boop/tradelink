/* ═══════════════════════════════════════════════════════════════
   TradeLink Theme Switcher Logic
   ═══════════════════════════════════════════════════════════════ */

(function() {
    // Apply theme immediately to prevent flash
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    injectThemeToggle();
});

function injectThemeToggle() {
    const isLight = document.body.classList.contains('light-mode');
    const toggleHTML = `
        <button id="theme-toggle" class="btn btn-sm btn-outline-secondary ms-2 me-2 theme-toggle-btn" title="تبديل الوضع">
            <i class="fas ${isLight ? 'fa-moon' : 'fa-sun'}"></i>
        </button>
    `;

    // Headers/Sidebars where we want the toggle
    const targets = [
        document.querySelector('.sidebar-brand'),
        document.querySelector('.mobile-top-bar'),
        document.querySelector('.page-header .d-flex'),
        document.querySelector('.logo'), // For auth.html
        document.querySelector('.hero-section') // For index.html
    ];

    targets.forEach(target => {
        if (target && !target.querySelector('.theme-toggle-wrapper')) {
            const div = document.createElement('div');
            div.className = 'theme-toggle-wrapper ms-auto mt-2';
            div.style.zIndex = '1100';
            div.innerHTML = toggleHTML;
            
            if (target.classList.contains('hero-section')) {
                div.style.position = 'absolute';
                div.style.top = '20px';
                div.style.right = '20px';
            }
            
            target.appendChild(div);
        }
    });

    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.onclick = toggleTheme;
    });
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    
    const isLight = body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');

    // Sync all icons
    document.querySelectorAll('.theme-toggle-btn i').forEach(icon => {
        icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
    });

    // Notify any active components (like charts) if needed
    window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: isLight ? 'light' : 'dark' } }));
}
