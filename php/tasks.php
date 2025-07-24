<?php
    header('Content-Type: application/json');

    function get_tasks() {
        require_once 'db_conn.php';

        $sql = "SELECT * FROM `tasks`";
        $result = $db->query($sql);

        if (!$result) {
            http_response_code(500);
            die(json_encode(['error' => $db->error]));
        }

        $tasks = [];
        while ($row = $result->fetch_assoc()) {
            $tasks[] = $row;
        }    
        $db->close();

        return $tasks;
    }

    function add_task($text) {
        require_once 'db_conn.php';

        $sql = "INSERT INTO tasks (task, status) VALUES (?, 0)";
        $stmt = $db->prepare($sql);
        $stmt->bind_param("s", $text);
        $stmt->execute();

        return $db->insert_id;
    }

    function complete_task($id) {
        require_once 'db_conn.php';
        
        $sql = "UPDATE tasks SET status = 1 WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            return ['status' => 'success'];
        } else {
            return ['error' => 'Task not found'];
        }
    }

    function delete_task($id) {
        require_once 'db_conn.php';
        
        $sql = "DELETE FROM tasks WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            return ['status' => 'success', 'id' => $id];
        } else {
            return ['error' => 'Task not found'];
        }
    }



    if ($_SERVER['REQUEST_METHOD'] == 'GET') {

        echo json_encode(get_tasks());

    } else {
        $data = json_decode(file_get_contents('php://input'), true);

        switch ($_SERVER['REQUEST_METHOD']) {
            case 'POST':
                if (!isset($data['text'])) {
                    http_response_code(400);
                    die(json_encode(['error' => 'Task text not found']));
                }

                echo json_encode([
                    'status' => 'success',
                    'id' => add_task($data['text'])
                ]);
                
                break;

            case 'PUT':
                if (!isset($data['id'])) {
                    http_response_code(400);
                    die(json_encode(['error' => 'Task ID not found']));
                }
                
                $result = complete_task($data['id']);

                if (isset($result['error'])) {
                    http_response_code(400);
                } else {
                    echo json_encode($result);
                }

                break;

            case 'DELETE':
                if (!isset($data['id'])) {
                    http_response_code(400);
                    die(json_encode(['error' => 'Task ID not found']));
                }
                
                $result = delete_task($data['id']);

                if (isset($result['error'])) {
                    http_response_code(404);
                    echo json_encode($result);
                } else {
                    echo json_encode($result);
                }

                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Метод не поддерживается']);
        }
    }
?>