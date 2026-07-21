<?php
header('Content-Type: application/json');
require_once 'config.php';

$conn = get_db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $conn->query("SELECT * FROM items ORDER BY category, name");
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    echo json_encode($items);
}

elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        $conn->close();
        exit;
    }
    $stmt = $conn->prepare("INSERT INTO items (name, category, quantity, unit, low_stock_threshold, expiry_date) VALUES (?, ?, ?, ?, ?, ?)");
    $expiry = !empty($data['expiry_date']) ? $data['expiry_date'] : null;
    $stmt->bind_param('ssdsds', $data['name'], $data['category'], $data['quantity'], $data['unit'], $data['low_stock_threshold'], $expiry);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['error' => $stmt->error]);
        $conn->close();
        exit;
    }
    echo json_encode(['id' => $stmt->insert_id]);
}

elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        $conn->close();
        exit;
    }
    $stmt = $conn->prepare("UPDATE items SET name=?, category=?, quantity=?, unit=?, low_stock_threshold=?, expiry_date=? WHERE id=?");
    $expiry = !empty($data['expiry_date']) ? $data['expiry_date'] : null;
    $stmt->bind_param('ssdsdsi', $data['name'], $data['category'], $data['quantity'], $data['unit'], $data['low_stock_threshold'], $expiry, $data['id']);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['error' => $stmt->error]);
        $conn->close();
        exit;
    }
    echo json_encode(['success' => true]);
}

elseif ($method === 'DELETE') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM items WHERE id=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
}

$conn->close();
