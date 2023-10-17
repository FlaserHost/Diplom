<?php
    session_start();

    /** @var $data */

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($_POST['csrf_token'] === $_SESSION['csrf_tokens']['reg-modal']) {
            require_once '../../access/access.php';
            require_once '../../functions.php';

            $mysqli = new mysqli(...$data);

            if ($mysqli->connect_error) {
                die("Произошла ошибка подключения: $mysqli->connect_error");
            }

            $requiredKeys = [
                'login',
                'firstname',
                'phone',
                'password',
                'confirm_password'
            ];

            $isValidPOST = POSTvalidator($requiredKeys);
            $completePOST = $isValidPOST['completePOST'];
            $problemField = $isValidPOST['problemField'];

            if ($completePOST) {
                $clientData = $_POST;
                $authUserToken = random_token();
                $_SESSION['auth_user_token'] = $authUserToken;

                $password = $clientData['password'];
                $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

                $registrationResponse = "INSERT INTO users (id_user, login, password_hash, firstname, phone, email) VALUES (?, ?, ?, ?, ?, ?)";

                if ($stmt = $mysqli->prepare($registrationResponse)) {
                    $stmt->bind_param(
                        'ssssss',
                        $authUserToken,
                        $clientData['login'],
                        $hashedPassword,
                        $clientData['firstname'],
                        $clientData['phone'],
                        $clientData['email']
                    );

                    if (!$stmt->execute()) {
                        die("Ошибка регистрации: $stmt->error");
                    }

                    $stmt->close();
                    $mysqli->close();

                    $_SESSION['register_complete'] = true;
                    header('Location: ../../../index.php');
                } else {
                    die('Не удалось подготовить запрос');
                }
            } else {
                die("Произошла ошибка. Переданы не все данные. Отсутствует: $problemField");
            }
        }
    } else {
        die('Некорректные параметры запроса');
    }
