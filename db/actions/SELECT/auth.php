<?php
    session_start();

    /** @var $data */

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($_POST['csrf_token'] === $_SESSION['csrf_tokens']['auth-user-modal']) {
            require_once '../../access/access.php';
            require_once '../../functions.php';

            $mysqli = new mysqli(...$data);

            if ($mysqli->connect_error) {
                die("Произошла ошибка подключения: $mysqli->connect_error");
            }

            $requiredKeys = [
                'login',
                'password'
            ];

            $isValidPOST = POSTvalidator($requiredKeys);
            $completePOST = $isValidPOST['completePOST'];
            $problemField = $isValidPOST['problemField'];

            if ($completePOST) {
                $clientData = $_POST;
                $login = $clientData['login'];

                $request = "SELECT password_hash FROM users WHERE login = ?";

                if ($stmt = $mysqli->prepare($request)) {
                    $stmt->bind_param('s', $login);

                    if (!$stmt->execute()) {
                        die("Не удалось выполнить авторизацию: $stmt->error");
                    }

                    $authResult = $stmt->get_result();
                    $authData = $authResult->fetch_all(MYSQLI_ASSOC);

                    $stmt->close();

                    $rowResult = $authData[0];
                    $entered_password = $clientData['password'];
                    $stored_password = $rowResult['password_hash'];

                    if (password_verify($entered_password, $stored_password)) {
                        echo 'Пароль верный';
                    } else {
                        echo 'Пароль неверный';
                    }
                } else {
                    die("Ошибка подготовки запроса: $stmt->error");
                }
            } else {
                die("Произошла ошибка. Переданы не все данные. Отсутствует: $problemField");
            }
        }
    } else {
        die('Ошибка запроса');
    }
