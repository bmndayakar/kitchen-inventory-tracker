<?php
// Fill these in with the values from Hostinger's hPanel -> Databases -> MySQL Databases
define('DB_HOST', 'localhost');
define('DB_NAME', 'u393531534_inventory');
define('DB_USER', 'u393531534_meher_bondili');
define('DB_PASS', 'Hunger_2025');

function get_db() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
    return $conn;
}
