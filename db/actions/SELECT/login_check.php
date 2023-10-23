<?php
    /** @var $data */

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_once '../../access/access.php';
        require_once '../../functions.php';

        $mysqli = new mysqli(...$data);

        if ($mysqli->connect_error) {
            die("Произошла ошибка подключения: $mysqli->connect_error");
        }

        $customs = json_decode(file_get_contents('php://input'));

        if ($customs) {
            $login = $customs->login;

            $request = "SELECT COUNT(id_row) as user_exist FROM users WHERE login = ?";

            if ($stmt = $mysqli->prepare($request)) {
                $stmt->bind_param('s', $login);

                if (!$stmt->execute()) {
                    die("Ошибка проверки логина: $stmt->error");
                }

                $result = $stmt->get_result();
                $toArray = $result->fetch_all(MYSQLI_ASSOC);

                $stmt->close();
                $mysqli->close();

                echo $toArray[0]['user_exist'];
            } else {
                die('Не удалось подготовить запрос');
            }
        } else {
            die('Логин не передан');
        }
    } else {
        die('Некорректный метод запроса');
    }
