<?php
/**
 * WEBTING - API REST DE SESIONES Y SEGURIDAD
 * Valida credenciales e inicios de sesión.
 */

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$rawInput = file_get_contents('php://input');
$inputData = json_decode($rawInput, true) ?: $_POST;

if ($action === 'login') {
    $username = trim($inputData['username'] ?? '');
    $password = trim($inputData['password'] ?? '');
    $pinCode  = trim($inputData['pinCode'] ?? '');

    // Validación básica de administrador
    if ($username === 'admin' && $pinCode === SECURITY_PIN_CODE) {
        $_SESSION['is_admin'] = true;
        $_SESSION['admin_user'] = 'SuperAdmin Webting';

        echo json_encode([
            'success' => true,
            'message' => 'Modo administrador activado.',
            'user' => $_SESSION['admin_user']
        ]);
        exit;
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Credenciales inválidas.'
        ]);
        exit;
    }
}

if ($action === 'logout') {
    unset($_SESSION['is_admin']);
    unset($_SESSION['admin_user']);
    session_destroy();
    
    echo json_encode([
        'success' => true,
        'message' => 'Sesión cerrada.'
    ]);
    exit;
}

if ($action === 'check') {
    echo json_encode([
        'authenticated' => isAdminAuthenticated(),
        'user' => $_SESSION['admin_user'] ?? null
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'Acción inválida.']);
?>
