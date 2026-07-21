/**
 * WEBTING - MOTOR DE EMULACIÓN DE IFRAME Y PANEL DE REPRODUCCIÓN
 * Administra el reproductor de juego, la tabla de posiciones y las teclas de control.
 */

const GameEngine = {
    currentGame: null,

    init() {
        this.cacheDOM();
        this.bindEvents();
    },

    cacheDOM() {
        this.gameModal = document.getElementById('gameModal');
        this.gameIframe = document.getElementById('gameIframe');
        
        // Elementos de la cabecera
        this.gameTitle = document.getElementById('gameTitle');
        this.gameSubjectText = document.getElementById('gameSubjectText');
        this.gameDiffText = document.getElementById('gameDiffText');
        this.gameAgeText = document.getElementById('gameAgeText');
        
        // Paneles laterales
        this.gameScoresList = document.getElementById('gameScoresList');
        this.gameControlsList = document.getElementById('gameControlsList');
        this.adminEditGameBtn = document.getElementById('adminEditGameBtn');
        
        // Formulario de envío de puntuación
        this.scoreForm = document.getElementById('submitScoreForm');
    },

    bindEvents() {
        const closeBtn = document.getElementById('btnCloseGame');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeGame());
        }

        const fullscreenBtn = document.getElementById('btnFullscreen');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        const reloadBtn = document.getElementById('btnReloadGame');
        if (reloadBtn) {
            reloadBtn.addEventListener('click', () => {
                if (this.gameIframe) this.gameIframe.src = this.gameIframe.src;
            });
        }

        if (this.scoreForm) {
            this.scoreForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleScoreSubmission();
            });
        }
    },

    /**
     * Cargar y emular juego mediante iframe
     */
    openGame(gameId) {
        const game = WebtingApp.games.find(g => g.id === gameId);
        if (!game) {
            WebtingApp.showToast('Juego no encontrado en catálogo.', 'error');
            return;
        }

        this.currentGame = game;
        this.gameTitle.textContent = game.title;
        
        // Asignar etiquetas de metadata
        if (this.gameSubjectText) this.gameSubjectText.textContent = `Asignatura: ${game.subject}`;
        if (this.gameDiffText) this.gameDiffText.textContent = `Dificultad: ${game.difficulty}`;
        if (this.gameAgeText) this.gameAgeText.textContent = `Edad: ${game.ageRange} años`;

        // Asignar iframe URL
        this.gameIframe.src = game.iframeUrl;

        // Renderizar componentes laterales
        this.renderLeaderboard(game.highScores || []);
        this.renderControls(game.controls || []);
        this.updateAdminControlsUI();

        // Activar modal
        this.gameModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeGame() {
        this.gameModal.classList.remove('active');
        this.gameIframe.src = 'about:blank';
        this.currentGame = null;
        document.body.style.overflow = '';
    },

    /**
     * Render de la tabla de posiciones con estilo de medalla
     */
    renderLeaderboard(scores) {
        if (!this.gameScoresList) return;

        // Ordenar puntuaciones de mayor a menor
        const sorted = [...scores].sort((a, b) => b.score - a.score);

        if (sorted.length === 0) {
            this.gameScoresList.innerHTML = `
                <li class="score-item" style="justify-content: center; font-weight: 700; color: var(--color-dark);">
                    ¡Sube tu primer récord!
                </li>
            `;
        } else {
            this.gameScoresList.innerHTML = sorted.map((s, idx) => `
                <li class="score-item rank-${idx + 1}">
                    <span class="score-rank">#${idx + 1}</span>
                    <span class="score-player" title="${s.player}">${s.player}</span>
                    <span class="score-points">${s.score.toLocaleString()}</span>
                </li>
            `).join('');
        }
    },

    /**
     * Render de los controles asignados
     */
    renderControls(controls) {
        if (!this.gameControlsList) return;

        if (controls.length === 0) {
            this.gameControlsList.innerHTML = `
                <div class="control-card">
                    <span class="control-key">Click</span>
                    <span class="control-action">Presiona dentro de la pantalla para interactuar.</span>
                </div>
            `;
            return;
        }

        this.gameControlsList.innerHTML = controls.map(c => `
            <div class="control-card">
                <span class="control-key">${c.key}</span>
                <span class="control-action">${c.action}</span>
            </div>
        `).join('');
    },

    updateAdminControlsUI() {
        if (this.adminEditGameBtn) {
            if (AuthEngine.isAdmin && this.currentGame) {
                this.adminEditGameBtn.style.display = 'inline-flex';
                this.adminEditGameBtn.onclick = () => {
                    AdminEngine.openEditModal(this.currentGame);
                };
            } else {
                this.adminEditGameBtn.style.display = 'none';
            }
        }
    },

    toggleFullscreen() {
        const container = document.getElementById('emulatorContainer');
        if (!container) return;

        if (!document.fullscreenElement) {
            if (container.requestFullscreen) container.requestFullscreen();
            else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    },

    /**
     * Registro e inserción en caliente de nuevo puntaje
     */
    async handleScoreSubmission() {
        if (!this.currentGame) return;

        const playerInput = document.getElementById('scorePlayerName');
        const scoreInput = document.getElementById('scorePointsValue');
        
        const player = playerInput.value.trim() || 'Jugador';
        const score = parseInt(scoreInput.value) || 0;

        if (score <= 0) {
            WebtingApp.showToast('Registra una puntuación válida.', 'error');
            return;
        }

        try {
            const res = await fetch('php/scores.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId: this.currentGame.id,
                    player: player,
                    score: score
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    WebtingApp.showToast(data.message);
                    playerInput.value = '';
                    scoreInput.value = '';
                    
                    // Recargar datos actualizados
                    await WebtingApp.loadGames();
                    const updated = WebtingApp.games.find(g => g.id === this.currentGame.id);
                    if (updated) {
                        this.currentGame = updated;
                        this.renderLeaderboard(updated.highScores || []);
                    }
                    return;
                }
            }
        } catch (e) {
            console.warn('Backend PHP no detectado. Guardando puntaje localmente...');
        }

        // Fallback local
        if (!this.currentGame.highScores) this.currentGame.highScores = [];
        this.currentGame.highScores.push({
            player: player,
            score: score,
            date: new Date().toISOString().split('T')[0]
        });

        // Ordenamiento y corte
        this.currentGame.highScores.sort((a,b) => b.score - a.score);
        this.currentGame.highScores = this.currentGame.highScores.slice(0, 10);

        localStorage.setItem('webting_games_v2', JSON.stringify(WebtingApp.games));
        this.renderLeaderboard(this.currentGame.highScores);
        playerInput.value = '';
        scoreInput.value = '';
        WebtingApp.showToast('Puntuación registrada en LocalStorage.');
    }
};

document.addEventListener('DOMContentLoaded', () => GameEngine.init());
