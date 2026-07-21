/**
 * Webting v3.0 - Motor del Panel de Administración Avanzado
 * Gestión de 4 Pestañas: Estadísticas (Dashboard), Juegos, Usuarios y Personalización del Sitio.
 * Sin requerir código PIN adicional.
 */

window.AdminEngine = (function() {
    'use strict';

    let state = {
        editingGameId: null
    };

    let dom = {};

    function init() {
        cacheDOM();
        bindEvents();
    }

    function cacheDOM() {
        dom.btnAdminPanel = document.getElementById('btnAdminPanel');
        dom.adminPanelModal = document.getElementById('adminPanelModal');
        dom.btnCloseAdminPanel = document.getElementById('btnCloseAdminPanel');

        // Pestañas
        dom.tabBtns = document.querySelectorAll('.admin-tab-btn');
        dom.tabPanels = document.querySelectorAll('.admin-tab-panel');

        // Contenidos de Pestañas
        dom.statsContainer = document.getElementById('statsContainer');
        dom.adminGamesList = document.getElementById('adminGamesList');
        dom.adminUsersList = document.getElementById('adminUsersList');
        dom.btnCreateGame = document.getElementById('btnCreateGame');

        // Editor de Juegos (Modal Secundario)
        dom.gameEditorModal = document.getElementById('gameEditorModal');
        dom.gameEditorForm = document.getElementById('gameEditorForm');
        dom.btnCloseGameEditor = document.getElementById('btnCloseGameEditor');
        dom.controlsContainer = document.getElementById('controlsContainer');
        dom.btnAddControlRow = document.getElementById('btnAddControlRow');

        // Formulario de Personalización
        dom.settingsForm = document.getElementById('settingsForm');
        dom.inputPrimaryColor = document.getElementById('settingPrimaryColor');
        dom.inputSecondaryColor = document.getElementById('settingSecondaryColor');
    }

    function bindEvents() {
        if (dom.btnAdminPanel) dom.btnAdminPanel.addEventListener('click', openAdminPanel);
        if (dom.btnCloseAdminPanel) dom.btnCloseAdminPanel.addEventListener('click', closeAdminPanel);

        // Eventos de Pestañas Administrativas
        dom.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                switchTab(targetTab);
            });
        });

        if (dom.btnCreateGame) {
            dom.btnCreateGame.addEventListener('click', () => openGameEditor());
        }

        if (dom.btnCloseGameEditor) {
            dom.btnCloseGameEditor.addEventListener('click', closeGameEditor);
        }

        if (dom.btnAddControlRow) {
            dom.btnAddControlRow.addEventListener('click', () => addControlRow());
        }

        if (dom.gameEditorForm) {
            dom.gameEditorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                handleSaveGame();
            });
        }

        if (dom.settingsForm) {
            dom.settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                handleSaveSettings();
            });
        }

        // Vista previa en tiempo real de colores
        if (dom.inputPrimaryColor) {
            dom.inputPrimaryColor.addEventListener('input', (e) => {
                document.documentElement.style.setProperty('--site-primary', e.target.value);
            });
        }
        if (dom.inputSecondaryColor) {
            dom.inputSecondaryColor.addEventListener('input', (e) => {
                document.documentElement.style.setProperty('--site-secondary', e.target.value);
            });
        }
    }

    function openAdminPanel() {
        if (!AuthEngine.isAdmin()) {
            WebtingApp.showToast('Acceso restringido a Administradores', 'error');
            return;
        }
        if (dom.adminPanelModal) {
            dom.adminPanelModal.classList.add('active');
            switchTab('dashboard');
        }
    }

    function closeAdminPanel() {
        if (dom.adminPanelModal) {
            dom.adminPanelModal.classList.remove('active');
        }
    }

    function switchTab(tabName) {
        dom.tabBtns.forEach(b => {
            if (b.dataset.tab === tabName) b.classList.add('active');
            else b.classList.remove('active');
        });

        dom.tabPanels.forEach(p => {
            if (p.id === `tabPanel-${tabName}`) p.style.display = 'block';
            else p.style.display = 'none';
        });

        if (tabName === 'dashboard') loadStats();
        else if (tabName === 'games') loadAdminGames();
        else if (tabName === 'users') loadAdminUsers();
        else if (tabName === 'settings') loadSettingsForm();
    }

    /* --- 1. Pestaña Dashboard / Estadísticas --- */
    function loadStats() {
        if (!dom.statsContainer) return;
        dom.statsContainer.innerHTML = '<div>Cargando métricas del sistema...</div>';

        fetch('php/admin.php?action=stats')
            .then(res => res.json())
            .then(res => {
                if (res.success && res.data) {
                    renderStats(res.data);
                }
            })
            .catch(() => {
                renderStats({
                    totalGames: WebtingApp.getGames().length,
                    totalUsers: 1,
                    totalScores: 0,
                    mostPlayedGame: 'Ninguno',
                    highestGlobalScore: '0 PTS',
                    recentUsers: 1
                });
            });
    }

    function renderStats(d) {
        dom.statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-label">Total de Juegos</span>
                    <span class="stat-value">${d.totalGames}</span>
                    <span class="stat-subtext">Juegos registrados</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Usuarios Registrados</span>
                    <span class="stat-value">${d.totalUsers}</span>
                    <span class="stat-subtext">+${d.recentUsers} nuevos esta semana</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Total Puntuaciones</span>
                    <span class="stat-value">${d.totalScores}</span>
                    <span class="stat-subtext">Partidas completadas</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Juego Más Popular</span>
                    <span class="stat-value" style="font-size:1.6rem;">${d.mostPlayedGame}</span>
                    <span class="stat-subtext">Por número de aperturas</span>
                </div>
            </div>
        `;
    }

    /* --- 2. Pestaña Gestión de Juegos --- */
    function loadAdminGames() {
        if (!dom.adminGamesList) return;
        const games = WebtingApp.getGames();

        if (games.length === 0) {
            dom.adminGamesList.innerHTML = '<p style="color:#666;">No hay juegos cargados en el sistema.</p>';
            return;
        }

        dom.adminGamesList.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Materia</th>
                        <th>Dificultad</th>
                        <th>Puntuación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${games.map(g => `
                        <tr>
                            <td><strong>${g.title}</strong></td>
                            <td>${g.subject}</td>
                            <td>${g.difficulty}</td>
                            <td>${g.scoring_enabled || g.scoringEnabled ? 'Sí' : 'No'}</td>
                            <td>
                                <button class="btn btn-secondary" onclick="AdminEngine.openGameEditor('${g.id}')">Editar</button>
                                <button class="btn btn-danger" onclick="AdminEngine.deleteGame('${g.id}')">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function openGameEditor(gameId = null) {
        state.editingGameId = gameId;
        if (!dom.gameEditorModal) return;

        dom.controlsContainer.innerHTML = '';

        if (gameId) {
            const game = WebtingApp.getGames().find(g => g.id === gameId);
            if (game) {
                document.getElementById('editorTitle').value = game.title;
                document.getElementById('editorSubject').value = game.subject;
                document.getElementById('editorDifficulty').value = game.difficulty;
                document.getElementById('editorAgeRange').value = game.ageRange || game.age_range;
                document.getElementById('editorCompetency').value = game.competency || '';
                document.getElementById('editorLogoUrl').value = game.logoUrl || game.logo_url || '';
                document.getElementById('editorIframeUrl').value = game.iframeUrl || game.iframe_url || '';
                document.getElementById('editorHoverDescription').value = game.hoverDescription || game.hover_description || '';

                // Opciones avanzadas de iframe y puntos
                document.getElementById('editorIframeScroll').checked = game.iframeScroll || game.iframe_scroll || false;
                document.getElementById('editorIframeFullscreen').checked = game.iframeFullscreen || game.iframe_fullscreen || true;
                document.getElementById('editorIframeSandbox').value = game.iframeSandbox || game.iframe_sandbox || '';
                document.getElementById('editorScoringEnabled').checked = game.scoringEnabled ?? game.scoring_enabled ?? true;

                // Controles
                if (Array.isArray(game.controls)) {
                    game.controls.forEach(c => addControlRow(c.key || c.key_name, c.action || c.action_desc));
                }
            }
        } else {
            dom.gameEditorForm.reset();
            addControlRow('Flechas', 'Mover personaje');
        }

        dom.gameEditorModal.classList.add('active');
    }

    function closeGameEditor() {
        if (dom.gameEditorModal) dom.gameEditorModal.classList.remove('active');
        state.editingGameId = null;
    }

    function addControlRow(key = '', action = '') {
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.innerHTML = `
            <input type="text" class="form-input ctrl-key" placeholder="Tecla (Ej: W / Flecha)" value="${key}" required style="flex:1;">
            <input type="text" class="form-input ctrl-action" placeholder="Acción (Ej: Saltar)" value="${action}" required style="flex:2;">
            <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">X</button>
        `;
        dom.controlsContainer.appendChild(row);
    }

    function handleSaveGame() {
        const controls = [];
        document.querySelectorAll('.dynamic-row').forEach(row => {
            const k = row.querySelector('.ctrl-key').value.trim();
            const a = row.querySelector('.ctrl-action').value.trim();
            if (k && a) controls.push({ key: k, action: a });
        });

        const gameData = {
            id: state.editingGameId || '',
            title: document.getElementById('editorTitle').value.trim(),
            subject: document.getElementById('editorSubject').value,
            difficulty: document.getElementById('editorDifficulty').value,
            ageRange: document.getElementById('editorAgeRange').value,
            competency: document.getElementById('editorCompetency').value.trim(),
            logoUrl: document.getElementById('editorLogoUrl').value.trim(),
            iframeUrl: document.getElementById('editorIframeUrl').value.trim(),
            hoverDescription: document.getElementById('editorHoverDescription').value.trim(),
            iframeScroll: document.getElementById('editorIframeScroll').checked,
            iframeFullscreen: document.getElementById('editorIframeFullscreen').checked,
            iframeSandbox: document.getElementById('editorIframeSandbox').value.trim(),
            scoringEnabled: document.getElementById('editorScoringEnabled').checked,
            controls
        };

        fetch('php/games.php?action=save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameData)
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                WebtingApp.showToast('Juego guardado correctamente', 'success');
                closeGameEditor();
                WebtingApp.loadGames();
                loadAdminGames();
            } else {
                WebtingApp.showToast(res.message || 'Error al guardar el juego', 'error');
            }
        })
        .catch(() => {
            // Guardar localmente
            let games = WebtingApp.getGames();
            if (!gameData.id) {
                gameData.id = 'game-' + Date.now();
                games.push(gameData);
            } else {
                const idx = games.findIndex(g => g.id === gameData.id);
                if (idx !== -1) games[idx] = gameData;
            }
            localStorage.setItem('webting_v3_games', JSON.stringify(games));
            WebtingApp.showToast('Juego guardado (Modo Local)', 'success');
            closeGameEditor();
            WebtingApp.loadGames();
            loadAdminGames();
        });
    }

    function deleteGame(gameId) {
        if (!confirm('¿Está seguro de eliminar este juego del sistema?')) return;

        fetch('php/games.php?action=delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: gameId })
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                WebtingApp.showToast('Juego eliminado', 'success');
                WebtingApp.loadGames();
                loadAdminGames();
            }
        })
        .catch(() => {
            let games = WebtingApp.getGames().filter(g => g.id !== gameId);
            localStorage.setItem('webting_v3_games', JSON.stringify(games));
            WebtingApp.showToast('Juego eliminado (Modo Local)', 'success');
            WebtingApp.loadGames();
            loadAdminGames();
        });
    }

    /* --- 3. Pestaña Usuarios --- */
    function loadAdminUsers() {
        if (!dom.adminUsersList) return;

        fetch('php/admin.php?action=users')
            .then(res => res.json())
            .then(res => {
                if (res.success && Array.isArray(res.data)) {
                    renderUsersTable(res.data);
                }
            })
            .catch(() => {
                renderUsersTable([
                    { id: 1, username: '//admin//', email: 'admin@webting.com', role: 'admin', email_verified: 1, created_at: 'Hoy' }
                ]);
            });
    }

    function renderUsersTable(users) {
        dom.adminUsersList.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado Email</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(u => `
                        <tr>
                            <td><strong>${u.username}</strong></td>
                            <td>${u.email}</td>
                            <td>${u.role}</td>
                            <td>${u.email_verified ? 'Verificado' : 'Pendiente'}</td>
                            <td>
                                ${u.username !== '//admin//' ? `<button class="btn btn-danger" onclick="AdminEngine.deleteUser(${u.id})">Eliminar</button>` : '<em>Cuenta Principal</em>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function deleteUser(userId) {
        if (!confirm('¿Desea eliminar la cuenta de usuario seleccionada?')) return;

        fetch('php/admin.php?action=delete_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        }).then(() => {
            WebtingApp.showToast('Usuario eliminado', 'success');
            loadAdminUsers();
        });
    }

    /* --- 4. Pestaña Personalización --- */
    function loadSettingsForm() {
        fetch('php/admin.php?action=get_settings')
            .then(res => res.json())
            .then(res => {
                if (res.success && res.data) {
                    const d = res.data;
                    if (d.primary_color) document.getElementById('settingPrimaryColor').value = d.primary_color;
                    if (d.secondary_color) document.getElementById('settingSecondaryColor').value = d.secondary_color;
                    if (d.banner_title) document.getElementById('settingBannerTitle').value = d.banner_title;
                    if (d.banner_subtitle) document.getElementById('settingBannerSubtitle').value = d.banner_subtitle;
                }
            });
    }

    function handleSaveSettings() {
        const settings = {
            primary_color: document.getElementById('settingPrimaryColor').value,
            secondary_color: document.getElementById('settingSecondaryColor').value,
            banner_title: document.getElementById('settingBannerTitle').value.trim(),
            banner_subtitle: document.getElementById('settingBannerSubtitle').value.trim()
        };

        fetch('php/admin.php?action=save_settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                localStorage.setItem('webting_v3_settings', JSON.stringify(settings));
                WebtingApp.showToast('Ajustes de personalización guardados', 'success');
            }
        })
        .catch(() => {
            localStorage.setItem('webting_v3_settings', JSON.stringify(settings));
            WebtingApp.showToast('Ajustes guardados localmente', 'success');
        });
    }

    return {
        init,
        openAdminPanel,
        closeAdminPanel,
        openGameEditor,
        deleteGame,
        deleteUser
    };
})();

document.addEventListener('DOMContentLoaded', AdminEngine.init);
