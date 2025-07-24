<?php
    $host = 'mysql';
    $username = 'admin';
    $password = 'xDW8Nzmf';
    $database = 'tasks_db';

    $db = new mysqli($host, $username, $password, $database);

    if ($db->connect_error) {
        die("DB connection error: " . $db->connect_error);
    }

    $db->set_charset('utf8mb4');
?>