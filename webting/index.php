<?php
/**
 * WEBTING - PORTAL DE JUEGOS EDUCATIVOS (ESTILO NEOBRUTALISTA)
 * Entrada principal PHP del portal arcade / comic.
 */
require_once __DIR__ . '/php/config.php';
$isAdmin = isAdminAuthenticated();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Webting - Plataforma interactiva de juegos educativos. Emulación de juegos, puntuaciones altas y panel de administración.">
    <title>Webting | Plataforma de Juegos Educativos</title>
    
    <!-- Hojas de Estilo CSS Modulares (Requerimiento 3) -->
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/game.css">
    <link rel="stylesheet" href="css/admin.css">
</head>
<body class="<?php echo $isAdmin ? 'admin-mode-active' : ''; ?>">

    <!-- Barra de Navegación Neobrutalista -->
    <header class="navbar">
        <a href="index.php" class="brand">
            <div class="brand-icon-wrapper">
                <!-- Icono SVG Gamepad (Sin Emojis) -->
                <svg class="brand-icon-svg" viewBox="0 0 24 24"><path d="M7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm4 0h2v2h-2zM4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v10h16V7H4z"/></svg>
            </div>
            <h1 class="brand-title">Web<span>ting</span></h1>
        </a>

        <!-- Buscador Reactivo en Tiempo Real -->
        <div class="search-box">
            <!-- Icono SVG Lupa -->
            <svg class="search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34C15.08 4.96 12.16 2 8.62 2 4.41 2 1 5.41 1 9.62c0 3.54 2.96 6.46 6.39 6.29A6.5 6.5 0 0 0 13 14.43l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-7.38 0c-2.43 0-4.4-1.97-4.4-4.4s1.97-4.4 4.4-4.4 4.4 1.97 4.4 4.4-1.97 4.4-4.4 4.4z"/></svg>
            <input type="text" id="searchInput" class="search-input" placeholder="Buscar juegos por título, dificultad, edad o área..." aria-label="Buscador de juegos">
        </div>

        <div class="nav-actions">
            <!-- Insignia de Administrador -->
            <span id="adminBadge" class="admin-badge" style="display: <?php echo $isAdmin ? 'inline-flex' : 'none'; ?>;">
                <!-- Icono SVG Escudo -->
                <svg class="admin-badge-svg" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.11v4.71c0 4.52-2.98 8.69-7 9.83-4.02-1.14-7-5.31-7-9.83V6.29l7-3.11z"/></svg>
                MODO ADMIN
            </span>

            <!-- Botón Agregar Juego (Menú exclusivo Admin) -->
            <button id="btnAdminAddGame" class="btn btn-primary" style="display: <?php echo $isAdmin ? 'inline-flex' : 'none'; ?>;">
                Agregar Juego
            </button>

            <!-- Acceso Jugadores / Cierre de sesión -->
            <button id="btnLoginNav" class="btn btn-outline-blue">
                🔑 Acceso Jugadores
            </button>
        </div>
    </header>

    <!-- Contenido Principal -->
    <main class="main-content">
        <!-- Banner Hero Cómic -->
        <section class="hero-banner animate-fade-in">
            <div class="hero-text">
                <h2 class="hero-title">Aprende Jugando en Vivo</h2>
                <p class="hero-subtitle">Descubre desafíos y emuladores web con personalidad humana propia. Sin diseños fríos o corporativos de IA.</p>
            </div>
        </section>

        <!-- Filtros Neobrutalistas Combinados -->
        <div class="filters-container animate-fade-in">
            <!-- Fila 1: Categorías -->
            <div class="filter-row" style="margin-bottom: 0.6rem;">
                <span class="filter-label">Asignatura:</span>
                <button class="filter-chip active" data-filter-type="category" data-category="all">Todos</button>
                <button class="filter-chip" data-filter-type="category" data-category="Matemáticas">Matemáticas</button>
                <button class="filter-chip" data-filter-type="category" data-category="Ciencias">Ciencias</button>
                <button class="filter-chip" data-filter-type="category" data-category="Lenguaje">Lenguaje</button>
                <button class="filter-chip" data-filter-type="category" data-category="Geografía">Geografía</button>
            </div>

            <!-- Fila 2: Dificultad -->
            <div class="filter-row" style="margin-bottom: 0.6rem;">
                <span class="filter-label">Dificultad:</span>
                <button class="filter-chip active-orange" data-filter-type="difficulty" data-difficulty="all">Todos</button>
                <button class="filter-chip" data-filter-type="difficulty" data-difficulty="Fácil">Fácil</button>
                <button class="filter-chip" data-filter-type="difficulty" data-difficulty="Medio">Medio</button>
                <button class="filter-chip" data-filter-type="difficulty" data-difficulty="Difícil">Difícil</button>
            </div>

            <!-- Fila 3: Rango de Edad -->
            <div class="filter-row">
                <span class="filter-label">Edad Recomendada:</span>
                <button class="filter-chip active-orange" data-filter-type="age" data-age="all">Todas</button>
                <button class="filter-chip" data-filter-type="age" data-age="6-8">6-8 años</button>
                <button class="filter-chip" data-filter-type="age" data-age="9-12">9-12 años</button>
                <button class="filter-chip" data-filter-type="age" data-age="12+">12+ años</button>
            </div>
        </div>

        <!-- Grilla de Tarjetas con Hover Descripción -->
        <section id="gamesGrid" class="games-grid">
            <!-- Cargado vía app.js -->
        </section>
    </main>

    <!-- Footer Cómic -->
    <footer class="footer">
        <p>&copy; 2026 Webting - Catálogo arcade educativo con diseño neobrutalista y código PIN de protección.</p>
    </footer>

    <!-- ==========================================================================
         MODAL 1: EMULADOR CENTRAL Y PANTALLA DE JUEGOS (3 COLUMNAS)
         ========================================================================== -->
    <div id="gameModal" class="game-view-modal" aria-hidden="true">
        <div class="game-view-header">
            <div class="game-view-title">
                <h2 id="gameTitle" class="game-title-text">Cargando Juego...</h2>
                <div class="game-meta-row">
                    <span id="gameSubjectText" class="meta-badge" style="background: #E0F7FA;"></span>
                    <span id="gameDiffText" class="meta-badge" style="background: #FFF3E0;"></span>
                    <span id="gameAgeText" class="meta-badge" style="background: #F3E5F5;"></span>
                </div>
            </div>
            
            <div style="display: flex; gap: 0.8rem; align-items: center;">
                <!-- Editar Juego (Visible solo Admin) -->
                <button id="adminEditGameBtn" class="btn btn-primary admin-edit-badge" style="padding: 0.4rem 1rem; font-size: 1.1rem;">
                    Editar Parámetros
                </button>
                <button id="btnCloseGame" class="btn-close-game" title="Cerrar Juego">✕</button>
            </div>
        </div>

        <div class="game-view-body">
            <!-- COLUMNA IZQUIERDA: Puntuaciones y Formulario en Caliente -->
            <aside class="game-sidebar-left">
                <h3 class="sidebar-title">
                    Tabla de Posiciones
                </h3>
                
                <ul id="gameScoresList" class="scores-list" style="flex: 1; overflow-y: auto; margin-bottom: 1rem;">
                    <!-- Cargado vía gameEngine.js -->
                </ul>

                <!-- Formulario interactivo neobrutalista para registrar puntuación -->
                <form id="submitScoreForm" style="border-top: 2px solid #000; padding-top: 0.8rem;">
                    <h4 style="font-family: 'VT323', monospace; font-size: 1.4rem; color: var(--color-orange); margin-bottom: 0.4rem;">Registrar Puntaje</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <input type="text" id="scorePlayerName" class="form-input" placeholder="Tu Apodo/Nombre" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" required>
                        <input type="number" id="scorePointsValue" class="form-input" placeholder="Puntos" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" min="1" required>
                        <button type="submit" class="btn btn-primary" style="padding: 0.4rem; font-size: 1.1rem; justify-content: center; border-radius: 6px;">Enviar Récord</button>
                    </div>
                </form>
            </aside>

            <!-- COLUMNA CENTRAL: Emulación Iframe HD con toolbar arcade -->
            <section id="emulatorContainer" class="game-emulator-container">
                <div class="iframe-wrapper">
                    <iframe id="gameIframe" class="game-iframe" src="about:blank" allow="autoplay; fullscreen; keyboard" title="Reproductor Webting"></iframe>
                </div>
                <div class="emulator-toolbar">
                    <span class="toolbar-info">Usa los comandos del panel para maximizar</span>
                    <div class="toolbar-actions">
                        <button id="btnReloadGame" class="btn-icon">Reiniciar</button>
                        <button id="btnFullscreen" class="btn-icon">Pantalla Completa</button>
                    </div>
                </div>
            </section>

            <!-- COLUMNA DERECHA: Guía de Teclado y Controles -->
            <aside class="game-sidebar-right">
                <h3 class="sidebar-title">Guía de Teclas</h3>
                <div id="gameControlsList" class="controls-list">
                    <!-- Cargado vía gameEngine.js -->
                </div>
            </aside>
        </div>
    </div>

    <!-- ==========================================================================
         MODAL 2: ACCESO JUGADORES / CREAR CUENTA (SIN MENTAR ADMIN EN LOGIN)
         ========================================================================== -->
    <div id="loginModal" class="modal-overlay" aria-hidden="true">
        <div class="modal-box">
            <div class="modal-header" style="margin-bottom: 1rem;">
                <h3 class="modal-title">🔐 Acceso Jugadores</h3>
                <button class="modal-close" onclick="AuthEngine.closeLoginModal()">✕</button>
            </div>
            
            <!-- Pestañas de Login / Registro -->
            <div class="auth-tabs">
                <button type="button" id="tabLogin" class="auth-tab-btn active">Iniciar Sesión</button>
                <button type="button" id="tabRegister" class="auth-tab-btn">Crear Cuenta</button>
            </div>
            
            <form id="loginForm" data-mode="login">
                <div class="form-group">
                    <label class="form-label" for="loginUsername">Nombre de Usuario</label>
                    <input type="text" id="loginUsername" class="form-input" placeholder="Nombre" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="loginPassword">Contraseña</label>
                    <input type="password" id="loginPassword" class="form-input" placeholder="••••••••" required>
                </div>

                <!-- Campos de Registro (Ocultos en Login) -->
                <div id="registerFields" style="display: none;">
                    <div class="pin-input-box">
                        <label class="pin-label" for="loginInvitationCode">
                            🔑 Código de Invitación / Verificación
                        </label>
                        <input type="password" id="loginInvitationCode" class="form-input pin-code-input" maxlength="6" placeholder="••••••">
                        <small style="color: #000; font-size: 0.75rem; display: block; margin-top: 0.4rem; text-align: center; font-weight: 700;">
                            Deja en blanco para cuenta normal. Ingresa <strong>889900</strong> para permisos de Admin.
                        </small>
                    </div>
                </div>

                <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.8rem;">
                    <button type="button" class="btn btn-outline-blue" onclick="AuthEngine.closeLoginModal()">Cancelar</button>
                    <button type="submit" id="submitAuthBtn" class="btn btn-primary">Iniciar Sesión</button>
                </div>
            </form>
        </div>
    </div>

    <!-- ==========================================================================
         MODAL 3: GESTIÓN DE JUEGOS Y EDICIÓN DE CLASIFICACIONES (ADMIN UPGRADED)
         ========================================================================== -->
    <div id="adminModal" class="modal-overlay" aria-hidden="true">
        <div class="modal-box modal-large">
            <div class="modal-header">
                <h3 id="adminModalTitle" class="modal-title">➕ Registrar Nuevo Juego</h3>
                <button id="btnCloseAdminModal" class="modal-close">✕</button>
            </div>

            <form id="adminForm">
                <!-- Información General -->
                <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label" for="adminGameTitle">Título del Juego</label>
                        <input type="text" id="adminGameTitle" class="form-input" placeholder="Ej. Fracciones Espaciales" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="adminGameSubject">Área / Asignatura</label>
                        <select id="adminGameSubject" class="form-select" required>
                            <option value="Matemáticas">Matemáticas</option>
                            <option value="Ciencias">Ciencias</option>
                            <option value="Lenguaje">Lenguaje</option>
                            <option value="Geografía">Geografía</option>
                        </select>
                    </div>
                </div>

                <!-- Metadatos de búsqueda Webting -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 1rem; margin-top: 0.5rem;">
                    <div class="form-group">
                        <label class="form-label" for="adminGameDifficulty">Nivel de Dificultad</label>
                        <select id="adminGameDifficulty" class="form-select" required>
                            <option value="Fácil">Fácil</option>
                            <option value="Medio">Medio</option>
                            <option value="Difícil">Difícil</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="adminGameAgeRange">Edad Recomendada</label>
                        <select id="adminGameAgeRange" class="form-select" required>
                            <option value="6-8">6-8 años</option>
                            <option value="9-12">9-12 años</option>
                            <option value="12+">12+ años</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="adminGameCompetency">Competencia Clave</label>
                        <input type="text" id="adminGameCompetency" class="form-input" placeholder="Ej. Lógica binaria">
                    </div>
                </div>

                <!-- URLs del Logo y el Iframe de Emulación -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem;">
                    <div class="form-group">
                        <label class="form-label" for="adminGameLogo">Imagen de Logo / Portada</label>
                        <input type="url" id="adminGameLogo" class="form-input" placeholder="https://ejemplo.com/logo.jpg">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="adminGameIframeUrl">Enlace de Emulación (URL de Iframe)</label>
                        <input type="url" id="adminGameIframeUrl" class="form-input" placeholder="https://playcanv.as/p/2O2rEa1B/" required>
                    </div>
                </div>

                <!-- Descripción Hover -->
                <div class="form-group">
                    <label class="form-label" for="adminGameHoverDesc">Breve Descripción (Solo visible en hover)</label>
                    <textarea id="adminGameHoverDesc" class="form-textarea" placeholder="Escribe la descripción emergente del juego..." required></textarea>
                </div>

                <!-- Configuración de Controles Guía -->
                <div class="form-group" style="margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 class="admin-section-subtitle" style="margin: 0; border: none; padding: 0;">Mapeo de Controles del Teclado</h4>
                        <button type="button" id="btnAddControlRow" class="btn btn-outline-blue" style="padding: 0.25rem 0.65rem; font-size: 1.1rem; border-radius: 6px;">
                            + Añadir Tecla
                        </button>
                    </div>
                    <div id="adminControlsContainer">
                        <!-- Filas dinámicas -->
                    </div>
                </div>

                <!-- Editor de Puntuaciones Altas -->
                <div class="form-group" style="margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 class="admin-section-subtitle" style="margin: 0; border: none; padding: 0;">Tabla de Puntuaciones Altas</h4>
                        <button type="button" id="btnAddScoreRow" class="btn btn-outline-blue" style="padding: 0.25rem 0.65rem; font-size: 1.1rem; border-radius: 6px;">
                            + Agregar Récord
                        </button>
                    </div>
                    <div id="adminScoresContainer">
                        <!-- Filas dinámicas -->
                    </div>
                </div>

                <!-- Confirmación de Seguridad PIN obligatorio para Admin -->
                <div class="pin-input-box">
                    <label class="pin-label" for="adminFormPinCode">
                        Confirmar Cambios con Código de Seguridad PIN
                    </label>
                    <input type="password" id="adminFormPinCode" class="form-input pin-code-input" maxlength="6" placeholder="••••••" required>
                </div>

                <!-- Botonera de Acción -->
                <div style="margin-top: 1.8rem; display: flex; justify-content: space-between; align-items: center;">
                    <button type="button" id="btnDeleteGame" class="btn" style="background: #FFCCCC; border: var(--thin-border); color: #FF0055; display: none; border-radius: 30px;">
                        Eliminar Juego del Catálogo
                    </button>

                    <div style="display: flex; gap: 0.8rem; margin-left: auto;">
                        <button type="button" class="btn btn-outline-blue" onclick="AdminEngine.closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Guardar Configuración</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Contenedor Toast para Notificaciones estilo cómic -->
    <div id="alertToast" class="alert-toast"></div>

    <!-- Scripts JavaScript Modulares (Requerimiento 3) -->
    <script src="js/app.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/gameEngine.js"></script>
    <script src="js/adminEngine.js"></script>
</body>
</html>
