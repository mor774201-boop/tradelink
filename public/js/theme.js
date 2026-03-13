/* ═══════════════════════════════════════════════════════════════
   TradeLink Theme Switcher Logic
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check and apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    // 2. Inject Theme Toggle Button dynamically into the top right (Mobile Top Bar or Page Header)
    injectThemeToggle();
});

function injectThemeToggle() {
    const isLight = document.body.classList.contains('light-mode');
    const toggleHTML = `
        <button id="theme-toggle" class="btn btn-sm btn-outline-secondary ms-2 me-2" style="border-radius: 8px; width: 40px; height: 40px; border-color: var(--border-color);">
            <i class="fas ${isLight ? 'fa-moon' : 'fa-sun'}"></i>
        </button>
    `;

    // Try finding the global sections
    const headerDesktop = document.querySelector('.sidebar-brand');
    const headerMobile = document.querySelector('.mobile-top-bar');

    if (headerDesktop) {
        // Wrap existing header content if needed, or append to end
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'd-flex justify-content-center mt-3 global-controls';
        controlsDiv.innerHTML = toggleHTML;
        headerDesktop.appendChild(controlsDiv);
    }

    if (headerMobile) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'd-flex align-items-center global-controls-mobile';
        controlsDiv.innerHTML = toggleHTML;
        headerMobile.insertBefore(controlsDiv, headerMobile.firstChild);
    }

    // Attach Event Listeners to the injected buttons
    document.querySelectorAll('#theme-toggle').forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    
    const isLight = body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');

    // Update icons on all toggle buttons
    document.querySelectorAll('#theme-toggle i').forEach(icon => {
        icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
    });
}
