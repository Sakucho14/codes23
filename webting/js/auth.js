/**
 * WEBTING - CONTROLADOR DE AUTENTICACIÓN Y MODO ADMIN
 * Administra el inicio de sesión ordinario, la creación de cuentas de administrador por PIN
 * y la persistencia local de usuarios para pruebas dinámicas.
 */

const AuthEngine = {
    isAdmin: false,
    currentUser: null,
    
    // Lista de usuarios registrados (fallback local)
    registeredUsers: [],

    init() {
        this.loadLocalUsers();
        this.cacheDOM();
        this.bindEvents();
        this.checkAuthStatus();
    },

    loadLocalUsers() {
        // Cargar base de usuarios de prueba
        const localUsers = localStorage.getItem('webting_users');
        if (localUsers) {
            this.registeredUsers = JSON.parse(localUsers);
        } else {
            // Usuario administrador y jugador común semilla por defecto
            this.registeredUsers = [
                { username: 'admin', password: '123', isAdmin: true },
                { username: 'jugador1', password: '123', isAdmin: false }
            ];
            localStorage.setItem('webting_users', JSON.stringify(this.registeredUsers));
        }
    },

    cacheDOM() {
        this.loginModal = document.getElementById('loginModal');
        this.btnLoginNav = document.getElementById('btnLoginNav');
        this.adminBadge = document.getElementById('adminBadge');
        
        // Formulario y Tabs
        this.loginForm = document.getElementById('loginForm');
        this.tabLogin = document.getElementById('tabLogin');
        this.tabRegister = document.getElementById('tabRegister');
        this.registerFields = document.getElementById('registerFields');
        this.submitAuthBtn = document.getElementById('submitAuthBtn');
        
        this.btnAdminAddGame = document.getElementById('btnAdminAddGame');
    },

    bindEvents() {
        if (this.btnLoginNav) {
            this.btnLoginNav.addEventListener('click', () => {
                if (this.currentUser) {
                    this.logout();
                } else {
                    this.openLoginModal();
                }
            });
        }

        // Intercambio de Pestañas (Login / Crear Cuenta)
        if (this.tabLogin && this.tabRegister) {
            this.tabLogin.addEventListener('click', () => this.switchTab('login'));
            this.tabRegister.addEventListener('click', () => this.switchTab('register'));
        }

        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAuthSubmit();
            });
        }
    },

    openLoginModal() {
        if (this.loginModal) {
            this.switchTab('login');
            this.loginModal.classList.add('active');
        }
    },

    closeLoginModal() {
        if (this.loginModal) {
            this.loginModal.classList.remove('active');
            this.loginForm.reset();
        }
    },

    /**
     * Alternar vistas entre Login de usuarios y Registro
     */
    switchTab(mode) {
        if (mode === 'login') {
            this.tabLogin.classList.add('active');
            this.tabRegister.classList.remove('active');
            this.registerFields.style.display = 'none';
            this.submitAuthBtn.textContent = 'Iniciar Sesión';
            this.loginForm.dataset.mode = 'login';
        } else {
            this.tabLogin.classList.remove('active');
            this.tabRegister.classList.add('active');
            this.registerFields.style.display = 'block';
            this.submitAuthBtn.textContent = 'Registrarse y Entrar';
            this.loginForm.dataset.mode = 'register';
        }
    },

    /**
     * Comprobar sesión guardada
     */
    async checkAuthStatus() {
        const loggedUser = sessionStorage.getItem('webting_user_active');
        if (loggedUser) {
            const user = JSON.parse(loggedUser);
            this.setSessionState(user);
            return;
        }

        try {
            const res = await fetch('php/auth.php?action=check');
            if (res.ok) {
                const data = await res.json();
                if (data.authenticated && data.user) {
                    this.setSessionState({ username: data.user, isAdmin: true });
                }
            }
        } catch (e) {}
    },

    /**
     * Procesar Inicio de sesión / Registro
     */
    async handleAuthSubmit() {
        const mode = this.loginForm.dataset.mode || 'login';
        const usernameInput = document.getElementById('loginUsername').value.trim();
        const passwordInput = document.getElementById('loginPassword').value.trim();

        if (mode === 'login') {
            // Intentar autenticación por API PHP
            try {
                const res = await fetch('php/auth.php?action=login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: usernameInput,
                        password: passwordInput,
                        pinCode: '889900' // Simulación PIN para backend PHP directo
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        const userObj = { username: usernameInput, isAdmin: true };
                        this.setSessionState(userObj);
                        this.closeLoginModal();
                        WebtingApp.showToast('Sesión activa como Administrador.');
                        return;
                    }
                }
            } catch (e) {
                // Fallback a motor local
            }

            // Validación en base local
            const user = this.registeredUsers.find(
                u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput
            );

            if (user) {
                this.setSessionState(user);
                this.closeLoginModal();
                WebtingApp.showToast(`Bienvenido, ${user.username}`);
            } else {
                WebtingApp.showToast('Nombre de usuario o contraseña incorrectos.', 'error');
            }

        } else if (mode === 'register') {
            // REGISTRO DE CUENTA
            const invitationCode = document.getElementById('loginInvitationCode').value.trim();
            
            // Si tiene el código PIN correcto (889900), se le asignan privilegios de administración
            const registerAsAdmin = (invitationCode === '889900');

            // Validar existencia previa
            const exist = this.registeredUsers.some(u => u.username.toLowerCase() === usernameInput.toLowerCase());
            if (exist) {
                WebtingApp.showToast('El nombre de usuario ya se encuentra registrado.', 'error');
                return;
            }

            const newUser = {
                username: usernameInput,
                password: passwordInput,
                isAdmin: registerAsAdmin
            };

            // Guardar usuario nuevo
            this.registeredUsers.push(newUser);
            localStorage.setItem('webting_users', JSON.stringify(this.registeredUsers));

            // Iniciar sesión con el usuario nuevo
            this.setSessionState(newUser);
            this.closeLoginModal();

            if (registerAsAdmin) {
                WebtingApp.showToast('¡Cuenta creada y modo Administrador activado!');
            } else {
                WebtingApp.showToast('¡Cuenta de jugador creada con éxito!');
            }
        }
    },

    /**
     * Establecer estado visual de los privilegios
     */
    setSessionState(user) {
        this.currentUser = user;
        this.isAdmin = user.isAdmin;
        
        sessionStorage.setItem('webting_user_active', JSON.stringify(user));

        if (this.isAdmin) {
            document.body.classList.add('admin-mode-active');
            if (this.adminBadge) this.adminBadge.style.display = 'inline-flex';
            if (this.btnAdminAddGame) this.btnAdminAddGame.style.display = 'inline-flex';
        } else {
            document.body.classList.remove('admin-mode-active');
            if (this.adminBadge) this.adminBadge.style.display = 'none';
            if (this.btnAdminAddGame) this.btnAdminAddGame.style.display = 'none';
        }

        if (this.btnLoginNav) {
            this.btnLoginNav.innerHTML = `🔒 Salir (${user.username})`;
        }

        // Actualizar vistas del emulador activo
        if (typeof GameEngine !== 'undefined' && GameEngine.currentGame) {
            GameEngine.updateAdminControlsUI();
        }
    },

    logout() {
        this.currentUser = null;
        this.isAdmin = false;
        
        sessionStorage.removeItem('webting_user_active');
        document.body.classList.remove('admin-mode-active');
        
        if (this.adminBadge) this.adminBadge.style.display = 'none';
        if (this.btnAdminAddGame) this.btnAdminAddGame.style.display = 'none';
        if (this.btnLoginNav) this.btnLoginNav.innerHTML = '🔑 Acceso Admin';

        try {
            fetch('php/auth.php?action=logout');
        } catch (e) {}

        WebtingApp.showToast('Sesión de usuario finalizada.');
        location.reload(); // Recargar para limpiar estados de emulador
    }
};

document.addEventListener('DOMContentLoaded', () => AuthEngine.init());
