<?php
/**
 * WEBTING - CONFIGURACIÓN DEL SERVIDOR PHP
 * Inicializa la sesión y define las rutas de persistencia de datos JSON.
 */

// Cookies seguras
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Configuración de encabezados HTTP para API REST JSON
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');

// Constantes globales de seguridad
define('SECURITY_PIN_CODE', '889900');
define('DATA_FILE_PATH', __DIR__ . '/../data/games.json');

/**
 * Leer listado de juegos
 * @return array
 */
function getGamesData() {
    if (!file_exists(DATA_FILE_PATH)) {
        return [];
    }
    $content = file_get_contents(DATA_FILE_PATH);
    return json_decode($content, true) ?: [];
}

/**
 * Guardar listado de juegos
 * @param array $data
 * @return bool
 */
function saveGamesData($data) {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents(DATA_FILE_PATH, $json) !== false;
}

/**
 * Validar si la sesión actual posee privilegios de administrador
 * @return bool
 */
function isAdminAuthenticated() {
    return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
}
?>
