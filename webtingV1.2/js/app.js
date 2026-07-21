/**
 * Webting v3.0 - Motor Principal de la Aplicación
 * Manejo de búsqueda, filtrado multi-categoría, personalización dinámica e iconos SVG.
 */

window.WebtingApp = (function() {
    'use strict';

    // SVG Icon Registry (Sin emojis)
    const ICONS = {
        gamepad: '<svg class="icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H9v2H7v-2H5v-2h2V9h2v2h2v2zm4.5 1c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
        search: '<svg class="icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
        user: '<svg class="icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
        shield: '<svg class="icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8s0 0 0 0z"/></svg>',
        trophy: '<svg class="icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>',
        settings: '<svg class="icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>',
        plus: '<svg class="icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
        close: '<svg class="icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
        check: '<svg class="icon-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
    };

    let state = {
        games: [],
        filterCategory: 'all',
        filterDifficulty: 'all',
        filterAge: 'all',
        searchQuery: ''
    };

    let dom = {};

    function init() {
        cacheDOM();
        bindEvents();
        loadSiteSettings();
        loadGames();
    }

    function cacheDOM() {
        dom.gamesGrid = document.getElementById('gamesGrid');
        dom.searchInput = document.getElementById('searchInput');
        dom.heroTitle = document.getElementById('heroTitle');
        dom.heroSubtitle = document.getElementById('heroSubtitle');
        dom.toastContainer = document.getElementById('toastContainer');
    }

    function bindEvents() {
        if (dom.searchInput) {
            dom.searchInput.addEventListener('input', (e) => {
                state.searchQuery = e.target.value.toLowerCase().trim();
                renderGames();
            });
        }

        // Delegación de eventos para filtros por categoría, dificultad y edad
        document.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;

            const filterType = chip.dataset.filterType;
            const filterVal = chip.dataset.filterValue;

            if (filterType === 'category') {
                state.filterCategory = filterVal;
                updateChipActiveState('[data-filter-type="category"]', chip);
            } else if (filterType === 'difficulty') {
                state.filterDifficulty = filterVal;
                updateChipActiveState('[data-filter-type="difficulty"]', chip);
            } else if (filterType === 'age') {
                state.filterAge = filterVal;
                updateChipActiveState('[data-filter-type="age"]', chip);
            }

            renderGames();
        });
    }

    function updateChipActiveState(selector, activeChip) {
        document.querySelectorAll(selector).forEach(c => {
            c.classList.remove('active', 'active-orange');
        });
        activeChip.classList.add(activeChip.dataset.filterType === 'category' ? 'active-orange' : 'active');
    }

    function loadSiteSettings() {
        fetch('php/admin.php?action=get_settings')
            .then(res => res.json())
            .then(res => {
                if (res.success && res.data) {
                    applySettings(res.data);
                } else {
                    loadSettingsFromLocal();
                }
            })
            .catch(() => loadSettingsFromLocal());
    }

    function loadSettingsFromLocal() {
        const local = localStorage.getItem('webting_v3_settings');
        if (local) {
            applySettings(JSON.parse(local));
        }
    }

    function applySettings(settings) {
        if (settings.primary_color) {
            document.documentElement.style.setProperty('--site-primary', settings.primary_color);
        }
        if (settings.secondary_color) {
            document.documentElement.style.setProperty('--site-secondary', settings.secondary_color);
        }
        if (settings.banner_title && dom.heroTitle) {
            dom.heroTitle.textContent = settings.banner_title;
        }
        if (settings.banner_subtitle && dom.heroSubtitle) {
            dom.heroSubtitle.textContent = settings.banner_subtitle;
        }
    }

    function loadGames() {
        fetch('php/games.php?action=list')
            .then(res => res.json())
            .then(res => {
                if (res.success && Array.isArray(res.data)) {
                    state.games = res.data;
                } else {
                    loadGamesFromLocal();
                }
                renderGames();
            })
            .catch(() => {
                loadGamesFromLocal();
                renderGames();
            });
    }

    function loadGamesFromLocal() {
        const local = localStorage.getItem('webting_v3_games');
        state.games = local ? JSON.parse(local) : [];
    }

    function renderGames() {
        if (!dom.gamesGrid) return;

        const filtered = state.games.filter(game => {
            const matchesCat = state.filterCategory === 'all' || game.subject === state.filterCategory;
            const matchesDiff = state.filterDifficulty === 'all' || game.difficulty === state.filterDifficulty;
            const matchesAge = state.filterAge === 'all' || game.ageRange === state.filterAge;
            const matchesSearch = !state.searchQuery || 
                game.title.toLowerCase().includes(state.searchQuery) ||
                game.subject.toLowerCase().includes(state.searchQuery) ||
                (game.hoverDescription && game.hoverDescription.toLowerCase().includes(state.searchQuery));

            return matchesCat && matchesDiff && matchesAge && matchesSearch;
        });

        if (filtered.length === 0) {
            dom.gamesGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-title">NO HAY JUEGOS DISPONIBLES</div>
                    <p class="empty-desc">Actualmente no existen juegos que coincidan con el filtro seleccionado. Si eres administrador, inicia sesión para añadir nuevos juegos.</p>
                </div>
            `;
            return;
        }

        dom.gamesGrid.innerHTML = filtered.map(game => `
            <div class="game-card" data-game-id="${game.id}">
                <div class="card-img-wrapper">
                    <img src="${game.logoUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80'}" alt="${game.title}" class="card-img" />
                    <div class="card-hover-overlay">
                        <p class="hover-desc">${game.hoverDescription || 'Sin descripción disponible.'}</p>
                        <button class="btn btn-primary" onclick="GameEngine.openGame('${game.id}')">
                            ${ICONS.gamepad} JUGAR EN VIVO
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-subject">${game.subject}</div>
                    <h3 class="card-title">${game.title}</h3>
                    <div class="card-meta">
                        <span class="meta-pill ${game.difficulty.toLowerCase()}">${game.difficulty}</span>
                        <span class="meta-pill">${game.ageRange} Años</span>
                        ${game.scoring_enabled || game.scoringEnabled ? `<span class="meta-pill scoring">PUNTOS REALES</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    function showToast(message, type = 'success') {
        if (!dom.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${type === 'success' ? ICONS.check : ICONS.close}</span> <span>${message}</span>`;
        dom.toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    return {
        init,
        getICONS: () => ICONS,
        getGames: () => state.games,
        loadGames,
        showToast
    };
})();

document.addEventListener('DOMContentLoaded', WebtingApp.init);
