<?php
header('Content-Type: application/json');
require_once 'config.php';

$conn = get_db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['item_id']) || empty($data['type']) || !isset($data['quantity'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        $conn->close();
        exit;
    }

    $conn->begin_transaction();

    $note = isset($data['note']) ? $data['note'] : null;
    $price = isset($data['price']) && $data['price'] !== '' ? $data['price'] : null;
    $stmt = $conn->prepare("INSERT INTO transactions (item_id, type, quantity, price, note) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param('isdds', $data['item_id'], $data['type'], $data['quantity'], $price, $note);
    if (!$stmt->execute()) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['error' => $stmt->error]);
        $conn->close();
        exit;
    }

    if ($data['type'] === 'consumed') {
        $update = $conn->prepare("UPDATE items SET quantity = GREATEST(0, quantity - ?) WHERE id = ?");
    } else {
        $update = $conn->prepare("UPDATE items SET quantity = quantity + ? WHERE id = ?");
    }
    $update->bind_param('di', $data['quantity'], $data['item_id']);
    $update->execute();

    if ($price !== null && $data['quantity'] > 0 && $data['type'] === 'added') {
        $new_unit_price = round($price / $data['quantity'], 2);
        $check = $conn->prepare("SELECT quantity, unit_price FROM items WHERE id = ?");
        $check->bind_param('i', $data['item_id']);
        $check->execute();
        $item_row = $check->get_result()->fetch_assoc();

        if ($item_row && $item_row['unit_price'] !== null) {
            $old_qty = floatval($item_row['quantity']) - floatval($data['quantity']);
            $old_value = $old_qty * floatval($item_row['unit_price']);
            $new_value = floatval($data['quantity']) * $new_unit_price;
            $total_qty = $old_qty + floatval($data['quantity']);
            $weighted_price = $total_qty > 0 ? round(($old_value + $new_value) / $total_qty, 2) : $new_unit_price;
        } else {
            $weighted_price = $new_unit_price;
        }

        $up = $conn->prepare("UPDATE items SET unit_price = ? WHERE id = ?");
        $up->bind_param('di', $weighted_price, $data['item_id']);
        $up->execute();
    }

    $conn->commit();
    echo json_encode(['success' => true]);
}

elseif ($method === 'GET') {
    $item_id = isset($_GET['item_id']) ? intval($_GET['item_id']) : 0;
    $date = isset($_GET['date']) ? $_GET['date'] : null;

    if ($item_id > 0) {
        $stmt = $conn->prepare("SELECT t.*, i.name AS item_name, i.unit FROM transactions t JOIN items i ON t.item_id = i.id WHERE t.item_id = ? ORDER BY t.created_at DESC LIMIT 50");
        $stmt->bind_param('i', $item_id);
    } elseif ($date) {
        $stmt = $conn->prepare("SELECT t.*, i.name AS item_name, i.unit FROM transactions t JOIN items i ON t.item_id = i.id WHERE DATE(CONVERT_TZ(t.created_at, '+00:00', '+05:30')) = ? ORDER BY t.created_at DESC");
        $stmt->bind_param('s', $date);
    } else {
        $stmt = $conn->prepare("SELECT t.*, i.name AS item_name, i.unit FROM transactions t JOIN items i ON t.item_id = i.id ORDER BY t.created_at DESC LIMIT 100");
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
}

$conn->close();
