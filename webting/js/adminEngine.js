/**
 * WEBTING - GESTOR CRUD Y EDITOR DE CLASIFICACIONES DE ADMINISTRACIÓN
 * Menú para agregar, editar juegos y corregir registros de puntuación.
 */

const AdminEngine = {
    editingGameId: null,

    init() {
        this.cacheDOM();
        this.bindEvents();
    },

    cacheDOM() {
        this.adminModal = document.getElementById('adminModal');
        this.adminForm = document.getElementById('adminForm');
        this.adminModalTitle = document.getElementById('adminModalTitle');
        
        this.btnAdminAddGame = document.getElementById('btnAdminAddGame');
        this.btnCloseAdminModal = document.getElementById('btnCloseAdminModal');
        
        // Elementos y filas dinámicas
        this.controlsContainer = document.getElementById('adminControlsContainer');
        this.btnAddControlRow = document.getElementById('btnAddControlRow');
        this.scoresContainer = document.getElementById('adminScoresContainer');
        this.btnAddScoreRow = document.getElementById('btnAddScoreRow');
        
        this.btnDeleteGame = document.getElementById('btnDeleteGame');
    },

    bindEvents() {
        if (this.btnAdminAddGame) {
            this.btnAdminAddGame.addEventListener('click', () => {
                if (!AuthEngine.isAdmin) {
                    WebtingApp.showToast('Acceso denegado. Se requiere cuenta de administrador.', 'error');
                    return;
                }
                this.openAddModal();
            });
        }

        if (this.btnCloseAdminModal) {
            this.btnCloseAdminModal.addEventListener('click', () => this.closeModal());
        }

        if (this.btnAddControlRow) {
            this.btnAddControlRow.addEventListener('click', () => this.addControlRow());
        }

        if (this.btnAddScoreRow) {
            this.btnAddScoreRow.addEventListener('click', () => this.addScoreRow());
        }

        if (this.adminForm) {
            this.adminForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveGame();
            });
        }

        if (this.btnDeleteGame) {
            this.btnDeleteGame.addEventListener('click', () => this.handleDeleteGame());
        }
    },

    openAddModal() {
        this.editingGameId = null;
        this.adminModalTitle.textContent = '➕ Registrar Nuevo Juego';
        this.adminForm.reset();
        if (this.btnDeleteGame) this.btnDeleteGame.style.display = 'none';

        // Filas por defecto para controles
        this.controlsContainer.innerHTML = '';
        this.addControlRow('Flechas / WASD', 'Mover jugador');
        this.addControlRow('Espacio', 'Saltar');

        // Fila por defecto para puntuaciones iniciales
        this.scoresContainer.innerHTML = '';
        this.addScoreRow('Jugador_Ejemplo', 1000);

        this.adminModal.classList.add('active');
    },

    openEditModal(game) {
        if (!AuthEngine.isAdmin) {
            WebtingApp.showToast('Privilegios insuficientes.', 'error');
            return;
        }

        this.editingGameId = game.id;
        this.adminModalTitle.textContent = `✏️ Editar Parámetros: ${game.title}`;
        if (this.btnDeleteGame) this.btnDeleteGame.style.display = 'inline-flex';

        // Precargar campos de formulario
        document.getElementById('adminGameTitle').value = game.title || '';
        document.getElementById('adminGameSubject').value = game.subject || 'Matemáticas';
        
        // Metadata avanzada Webting
        document.getElementById('adminGameDifficulty').value = game.difficulty || 'Medio';
        document.getElementById('adminGameAgeRange').value = game.ageRange || '9-12';
        document.getElementById('adminGameCompetency').value = game.competency || '';
        
        document.getElementById('adminGameLogo').value = game.logo || '';
        document.getElementById('adminGameHoverDesc').value = game.hoverDescription || '';
        document.getElementById('adminGameIframeUrl').value = game.iframeUrl || '';

        // Cargar controles guía
        this.controlsContainer.innerHTML = '';
        if (game.controls && game.controls.length > 0) {
            game.controls.forEach(c => this.addControlRow(c.key, c.action));
        } else {
            this.addControlRow('Mouse Clic', 'Interactuar');
        }

        // Cargar tabla de clasificaciones editable
        this.scoresContainer.innerHTML = '';
        if (game.highScores && game.highScores.length > 0) {
            const sorted = [...game.highScores].sort((a,b) => b.score - a.score);
            sorted.forEach(s => this.addScoreRow(s.player, s.score));
        } else {
            this.addScoreRow('Jugador_Semilla', 500);
        }

        this.adminModal.classList.add('active');
    },

    closeModal() {
        this.adminModal.classList.remove('active');
        this.editingGameId = null;
        document.getElementById('adminFormPinCode').value = '';
    },

    addControlRow(key = '', action = '') {
        const div = document.createElement('div');
        div.className = 'dynamic-row';
        div.innerHTML = `
            <input type="text" class="form-input ctrl-key" placeholder="Tecla" value="${key}" required>
            <input type="text" class="form-input ctrl-action" placeholder="Acción" value="${action}" required>
            <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
        `;
        this.controlsContainer.appendChild(div);
    },

    addScoreRow(player = '', score = '') {
        const div = document.createElement('div');
        div.className = 'scores-edit-row';
        div.innerHTML = `
            <input type="text" class="form-input score-user" placeholder="Nombre" value="${player}" required>
            <input type="number" class="form-input score-val" placeholder="Puntos" value="${score}" required min="0">
            <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
        `;
        this.scoresContainer.appendChild(div);
    },

    /**
     * Guardar/Guardar cambios en juego con validación obligatoria de PIN
     */
    async handleSaveGame() {
        const title = document.getElementById('adminGameTitle').value.trim();
        const subject = document.getElementById('adminGameSubject').value.trim();
        
        // Metadata Webting
        const difficulty = document.getElementById('adminGameDifficulty').value.trim();
        const ageRange = document.getElementById('adminGameAgeRange').value.trim();
        const competency = document.getElementById('adminGameCompetency').value.trim();
        
        const logo = document.getElementById('adminGameLogo').value.trim();
        const hoverDescription = document.getElementById('adminGameHoverDesc').value.trim();
        const iframeUrl = document.getElementById('adminGameIframeUrl').value.trim();
        const pinCode = document.getElementById('adminFormPinCode').value.trim();

        // Validar PIN de seguridad
        if (pinCode !== AuthEngine.securityPin) {
            WebtingApp.showToast('Código de Seguridad PIN incorrecto. Cambios rechazados.', 'error');
            return;
        }

        // Compilar controles
        const controlRows = this.controlsContainer.querySelectorAll('.dynamic-row');
        const controls = [];
        controlRows.forEach(row => {
            const k = row.querySelector('.ctrl-key').value.trim();
            const a = row.querySelector('.ctrl-action').value.trim();
            if (k && a) controls.push({ key: k, action: a });
        });

        // Compilar clasificaciones
        const scoreRows = this.scoresContainer.querySelectorAll('.scores-edit-row');
        const highScores = [];
        scoreRows.forEach(row => {
            const player = row.querySelector('.score-user').value.trim();
            const scoreVal = parseInt(row.querySelector('.score-val').value) || 0;
            if (player && scoreVal >= 0) {
                highScores.push({
                    player: player,
                    score: scoreVal,
                    date: new Date().toISOString().split('T')[0]
                });
            }
        });

        highScores.sort((a,b) => b.score - a.score);

        const payload = {
            id: this.editingGameId || ('game-' + Date.now()),
            title,
            subject,
            difficulty,
            ageRange,
            competency,
            logo: logo || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80',
            hoverDescription,
            iframeUrl,
            controls,
            highScores,
            securityPin: pinCode
        };

        // Guardar vía PHP backend
        try {
            const res = await fetch('php/games.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    WebtingApp.showToast(data.message);
                    this.closeModal();
                    await WebtingApp.loadGames();
                    if (GameEngine.currentGame && GameEngine.currentGame.id === payload.id) {
                        GameEngine.openGame(payload.id);
                    }
                    return;
                }
            }
        } catch (e) {
            console.warn('Backend PHP no disponible. Utilizando guardado local...');
        }

        // Guardar localmente
        if (this.editingGameId) {
            const index = WebtingApp.games.findIndex(g => g.id === this.editingGameId);
            if (index !== -1) WebtingApp.games[index] = payload;
        } else {
            WebtingApp.games.push(payload);
        }

        localStorage.setItem('webting_games_v2', JSON.stringify(WebtingApp.games));
        WebtingApp.renderGames();
        this.closeModal();
        WebtingApp.showToast('Juego guardado correctamente.');

        if (GameEngine.currentGame && GameEngine.currentGame.id === payload.id) {
            GameEngine.openGame(payload.id);
        }
    },

    /**
     * Eliminar juego
     */
    async handleDeleteGame() {
        if (!this.editingGameId) return;

        const pinCode = document.getElementById('adminFormPinCode').value.trim();
        if (pinCode !== AuthEngine.securityPin) {
            WebtingApp.showToast('Debes ingresar el PIN de confirmación para eliminar un juego.', 'error');
            return;
        }

        if (!confirm('¿Deseas eliminar este juego de Webting permanentemente?')) return;

        try {
            const res = await fetch('php/games.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id: this.editingGameId, securityPin: pinCode })
            });

            if (res.ok) {
                this.closeModal();
                if (GameEngine.currentGame) GameEngine.closeGame();
                await WebtingApp.loadGames();
                WebtingApp.showToast('Juego eliminado del catálogo.');
                return;
            }
        } catch (e) {}

        // Fallback local
        WebtingApp.games = WebtingApp.games.filter(g => g.id !== this.editingGameId);
        localStorage.setItem('webting_games_v2', JSON.stringify(WebtingApp.games));
        WebtingApp.renderGames();
        this.closeModal();
        if (GameEngine.currentGame) GameEngine.closeGame();
        WebtingApp.showToast('Juego eliminado.');
    }
};

document.addEventListener('DOMContentLoaded', () => AdminEngine.init());
