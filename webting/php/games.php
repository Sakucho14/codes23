<?php
/**
 * WEBTING - API REST DE GESTIÓN DE JUEGOS (CRUD)
 * Permite listar, agregar, editar y eliminar juegos del catálogo validando el PIN de seguridad.
 */

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: [];

// LISTAR JUEGOS (GET) - Público
if ($method === 'GET') {
    $games = getGamesData();
    echo json_encode(['success' => true, 'games' => $games]);
    exit;
}

// CONTROL DE ESCRITURA (POST) - Protegido por PIN
if ($method === 'POST') {
    $pinProvided = $data['securityPin'] ?? '';
    
    // Validar código PIN máster obligatorio para guardar o eliminar juegos
    if (!isAdminAuthenticated() && $pinProvided !== SECURITY_PIN_CODE) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Acceso denegado. Se requiere Código PIN de Seguridad válido.'
        ]);
        exit;
    }

    $games = getGamesData();
    $action = $data['action'] ?? 'save';

    // ACCIÓN: ELIMINAR JUEGO
    if ($action === 'delete') {
        $gameId = $data['id'] ?? '';
        $filtered = array_filter($games, function($g) use ($gameId) {
            return $g['id'] !== $gameId;
        });

        if (saveGamesData(array_values($filtered))) {
            echo json_encode(['success' => true, 'message' => 'Juego eliminado del catálogo con éxito.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error de escritura en el servidor.']);
        }
        exit;
    }

    // ACCIÓN: CREAR O EDITAR JUEGO (Con metadatos expandidos)
    $gameId = $data['id'] ?? ('game-' . time());
    $title = trim($data['title'] ?? 'Nuevo Juego');
    $subject = trim($data['subject'] ?? 'General');
    
    // Metadata expandida Webting
    $difficulty = trim($data['difficulty'] ?? 'Medio');
    $ageRange = trim($data['ageRange'] ?? '9-12');
    $competency = trim($data['competency'] ?? 'General');
    
    $logo = trim($data['logo'] ?? '');
    $hoverDescription = trim($data['hoverDescription'] ?? '');
    $iframeUrl = trim($data['iframeUrl'] ?? '');
    $controls = $data['controls'] ?? [];
    $highScores = $data['highScores'] ?? [];

    if (empty($iframeUrl)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'La URL de emulación iframe es obligatoria.']);
        exit;
    }

    $newGameData = [
        'id' => $gameId,
        'title' => $title,
        'subject' => $subject,
        'difficulty' => $difficulty,
        'ageRange' => $ageRange,
        'competency' => $competency,
        'logo' => $logo ?: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80',
        'hoverDescription' => $hoverDescription,
        'iframeUrl' => $iframeUrl,
        'controls' => $controls,
        'highScores' => $highScores
    ];

    $updated = false;
    foreach ($games as $index => $g) {
        if ($g['id'] === $gameId) {
            $games[$index] = $newGameData;
            $updated = true;
            break;
        }
    }

    if (!$updated) {
        $games[] = $newGameData;
    }

    if (saveGamesData($games)) {
        echo json_encode([
            'success' => true,
            'message' => $updated ? 'Juego actualizado con éxito.' : 'Juego registrado correctamente en catálogo.',
            'game' => $newGameData
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al guardar los datos en el servidor.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Método HTTP no soportado.']);
?>
