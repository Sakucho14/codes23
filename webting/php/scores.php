<?php
/**
 * WEBTING - API REST DE CLASIFICACIÓN Y MARCADORES
 * Registra nuevas puntuaciones de jugadores en caliente.
 */

require_once __DIR__ . '/config.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: $_POST;

$gameId = $data['gameId'] ?? '';
$playerName = trim($data['player'] ?? 'Jugador');
$score = intval($data['score'] ?? 0);

if (empty($gameId) || $score <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Parámetros de puntuación inválidos.']);
    exit;
}

$games = getGamesData();
$gameFound = false;

foreach ($games as &$game) {
    if ($game['id'] === $gameId) {
        $gameFound = true;
        
        // Agregar registro de puntuación
        $game['highScores'][] = [
            'player' => htmlspecialchars($playerName),
            'score' => $score,
            'date' => date('Y-m-d')
        ];

        // Ordenar descendentemente
        usort($game['highScores'], function($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        // Limitar a los 10 mejores
        $game['highScores'] = array_slice($game['highScores'], 0, 10);
        break;
    }
}

if ($gameFound) {
    if (saveGamesData($games)) {
        echo json_encode(['success' => true, 'message' => 'Récord registrado con éxito.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al guardar los datos en el servidor.']);
    }
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Juego no encontrado.']);
}
?>
