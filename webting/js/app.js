/**
 * WEBTING - GESTOR PRINCIPAL DE LA APLICACIÓN Y BUSCADOR MULTI-FILTRO
 * Lógica del buscador en tiempo real, chips de filtro combinados e iconos SVG dinámicos.
 */

document.addEventListener('DOMContentLoaded', () => {
    WebtingApp.init();
});

const WebtingApp = {
    // Listado de juegos
    games: [],
    
    // Filtros activos en caliente
    currentCategory: 'all',
    currentDifficulty: 'all',
    currentAge: 'all',
    searchQuery: '',

    // Iconos SVG en duro para evitar emojis y dar aspecto humano diseñado (Requerimiento)
    svgIcons: {
        gamepad: `<svg class="brand-icon-svg" viewBox="0 0 24 24"><path d="M7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm4 0h2v2h-2zM4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v10h16V7H4z"/></svg>`,
        magnifier: `<svg class="search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34C15.08 4.96 12.16 2 8.62 2 4.41 2 1 5.41 1 9.62c0 3.54 2.96 6.46 6.39 6.29A6.5 6.5 0 0 0 13 14.43l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-7.38 0c-2.43 0-4.4-1.97-4.4-4.4s1.97-4.4 4.4-4.4 4.4 1.97 4.4 4.4-1.97 4.4-4.4 4.4z"/></svg>`,
        badge: `<svg class="admin-badge-svg" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.11v4.71c0 4.52-2.98 8.69-7 9.83-4.02-1.14-7-5.31-7-9.83V6.29l7-3.11z"/></svg>`,
        difficulty: `<svg style="width:14px;height:14px;fill:currentColor;vertical-align:middle;margin-right:2px;" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 3.99L18.8 19H5.2L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/></svg>`,
        age: `<svg style="width:14px;height:14px;fill:currentColor;vertical-align:middle;margin-right:2px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z"/></svg>`,
        brain: `<svg style="width:14px;height:14px;fill:currentColor;vertical-align:middle;margin-right:2px;" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.17 19.59 10.53 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>`
    },

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadGames();
    },

    cacheDOM() {
        this.gamesGrid = document.getElementById('gamesGrid');
        this.searchInput = document.getElementById('searchInput');
        this.toast = document.getElementById('alertToast');
        
        // Contenedores de botones de filtro
        this.catChips = document.querySelectorAll('[data-filter-type="category"]');
        this.diffChips = document.querySelectorAll('[data-filter-type="difficulty"]');
        this.ageChips = document.querySelectorAll('[data-filter-type="age"]');
    },

    bindEvents() {
        // Buscador reactivo al input del usuario
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderGames();
            });
        }

        // Filtros por materia/asignatura
        this.catChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.catChips.forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category || 'all';
                this.renderGames();
            });
        });

        // Filtros por nivel de dificultad
        this.diffChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.diffChips.forEach(c => c.classList.remove('active-orange'));
                e.target.classList.add('active-orange');
                this.currentDifficulty = e.target.dataset.difficulty || 'all';
                this.renderGames();
            });
        });

        // Filtros por rango de edad
        this.ageChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.ageChips.forEach(c => c.classList.remove('active-orange'));
                e.target.classList.add('active-orange');
                this.currentAge = e.target.dataset.age || 'all';
                this.renderGames();
            });
        });
    },

    /**
     * Cargar el listado de juegos con fallback de LocalStorage si no corre en PHP
     */
    async loadGames() {
        try {
            const res = await fetch('php/games.php');
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.games) {
                    this.games = data.games;
                    localStorage.setItem('webting_games_v2', JSON.stringify(this.games));
                    this.renderGames();
                    return;
                }
            }
        } catch (e) {
            console.warn('Backend PHP no detectado. Cargando almacenamiento local Webting...');
        }

        // Fallback a LocalStorage para carga estática
        const localData = localStorage.getItem('webting_games_v2');
        if (localData) {
            this.games = JSON.parse(localData);
        } else {
            // Juegos por defecto de Webting con sus metadatos
            this.games = [
                {
                    id: "game-1",
                    title: "Math Racer 3D: Tablas de Multiplicar",
                    subject: "Matemáticas",
                    difficulty: "Medio",
                    ageRange: "9-12",
                    competency: "Cálculo mental rápido",
                    logo: "https://images.unsplash.com/photo-1614680376593-902f749f7b6c?w=400&q=80",
                    hoverDescription: "Compite a alta velocidad resolviendo operaciones matemáticas antes de que se agote el tiempo. ¡Ideal para agilidad mental!",
                    iframeUrl: "https://playcanv.as/p/2O2rEa1B/",
                    controls: [
                        { key: "Flechas / WASD", action: "Mover el vehículo" },
                        { key: "Espacio", action: "Activar Nitro al responder bien" },
                        { key: "1 - 4", action: "Seleccionar respuesta correcta" }
                    ],
                    highScores: [
                        { player: "Lucía_Math", score: 9850, date: "2026-07-20" },
                        { player: "Carlos_Speed", score: 9200, date: "2026-07-19" },
                        { player: "Sofía_Pro", score: 8750, date: "2026-07-18" }
                    ]
                },
                {
                    id: "game-2",
                    title: "Laberinto de la Célula Biológica",
                    subject: "Ciencias",
                    difficulty: "Difícil",
                    ageRange: "12+",
                    competency: "Identificación de organelos",
                    logo: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80",
                    hoverDescription: "Explora el interior de la célula eucariota, recolecta ATP y evita virus dañinos aprendiendo anatomía celular.",
                    iframeUrl: "https://playcanv.as/p/2O2rEa1B/",
                    controls: [
                        { key: "W / A / S / D", action: "Navegar por la membrana" },
                        { key: "Mouse Clic", action: "Escanear organelos" },
                        { key: "E", action: "Recolectar moléculas de ATP" }
                    ],
                    highScores: [
                        { player: "BioMaster_Ana", score: 12400, date: "2026-07-21" },
                        { player: "Kevin_Cell", score: 11150, date: "2026-07-17" }
                    ]
                },
                {
                    id: "game-3",
                    title: "Word Quest: Desafío Gramatical",
                    subject: "Lenguaje",
                    difficulty: "Fácil",
                    ageRange: "6-8",
                    competency: "Ortografía y sinónimos",
                    logo: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
                    hoverDescription: "Encuentra sinónimos, antónimos y resuelve acertijos ortográficos para abrir cofres del tesoro legendarios.",
                    iframeUrl: "https://playcanv.as/p/2O2rEa1B/",
                    controls: [
                        { key: "Teclado Alfanumérico", action: "Escribir palabras" },
                        { key: "Enter", action: "Enviar respuesta" }
                    ],
                    highScores: [
                        { player: "Gabriel_Lexicon", score: 15600, date: "2026-07-21" }
                    ]
                }
            ];
            localStorage.setItem('webting_games_v2', JSON.stringify(this.games));
        }

        this.renderGames();
    },

    /**
     * Renderización con filtrado cruzado dinámico (anti-simetría cómic)
     */
    renderGames() {
        if (!this.gamesGrid) return;

        const filtered = this.games.filter(game => {
            const matchCat = (this.currentCategory === 'all') || 
                             (game.subject.toLowerCase() === this.currentCategory.toLowerCase());
            
            const matchDiff = (this.currentDifficulty === 'all') || 
                              (game.difficulty.toLowerCase() === this.currentDifficulty.toLowerCase());
            
            const matchAge = (this.currentAge === 'all') || 
                             (game.ageRange.includes(this.currentAge));
            
            const matchSearch = game.title.toLowerCase().includes(this.searchQuery) ||
                                 game.subject.toLowerCase().includes(this.searchQuery) ||
                                 (game.competency && game.competency.toLowerCase().includes(this.searchQuery)) ||
                                 game.hoverDescription.toLowerCase().includes(this.searchQuery);
            
            return matchCat && matchDiff && matchAge && matchSearch;
        });

        // Caso sin juegos
        if (filtered.length === 0) {
            this.gamesGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
                    <div style="font-size: 4rem; font-family: 'VT323', monospace; color: var(--color-orange);">NINGUNO ENCONTRADO</div>
                    <p style="font-weight: 700; color: var(--color-dark); margin-top: 0.5rem;">Intenta desactivar algunos filtros para ver más opciones.</p>
                </div>
            `;
            return;
        }

        // Renderizado de tarjetas con rotaciones asimétricas de aspecto humano
        this.gamesGrid.innerHTML = filtered.map(game => {
            const diffClass = `difficulty-${game.difficulty.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;
            
            return `
                <div class="game-card animate-fade-in" onclick="GameEngine.openGame('${game.id}')">
                    <div class="card-image-wrapper">
                        <img src="${game.logo}" alt="${game.title}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80'">
                        
                        <!-- HOVER DESCRIPCIÓN SIN EMOJIS -->
                        <div class="card-hover-overlay">
                            <p class="overlay-description">${game.hoverDescription || 'Sin descripción disponible.'}</p>
                            <button class="overlay-btn">JUGAR</button>
                        </div>
                    </div>
                    
                    <div class="card-info">
                        <div>
                            <span class="card-subject">${game.subject}</span>
                            <h3 class="card-title">${game.title}</h3>
                        </div>
                        
                        <!-- Badges con iconos SVG (No emojis) -->
                        <div class="card-meta-badges">
                            <span class="meta-badge ${diffClass}">
                                ${this.svgIcons.difficulty} ${game.difficulty}
                            </span>
                            <span class="meta-badge">
                                ${this.svgIcons.age} ${game.ageRange} años
                            </span>
                            ${game.competency ? `
                                <span class="meta-badge" style="background: #E0F7FA;">
                                    ${this.svgIcons.brain} ${game.competency}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    showToast(message, type = 'success') {
        if (!this.toast) return;
        this.toast.className = `alert-toast alert-${type} active`;
        this.toast.innerHTML = `<span>${type === 'success' ? '✓' : '⚠'}</span> ${message}`;
        
        setTimeout(() => {
            this.toast.classList.remove('active');
        }, 3500);
    }
};
