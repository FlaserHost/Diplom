<?php
    session_start();

    /** @var $data */

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $customs = json_decode(file_get_contents('php://input'));

        if ($customs->csrf_token === $_SESSION['csrf_tokens']['auth-user-modal']) {
            require_once '../../access/access.php';
            require_once '../../functions.php';

            $mysqli = new mysqli(...$data);

            if ($mysqli->connect_error) {
                die("Произошла ошибка подключения: $mysqli->connect_error");
            }

            if ($customs) {
                $login = $customs->login;

                $request = "SELECT login, id_sex, password_hash, id_user FROM users WHERE login = ?";

                if ($stmt = $mysqli->prepare($request)) {
                    $stmt->bind_param('s', $login);

                    if (!$stmt->execute()) {
                        die("Не удалось выполнить авторизацию: $stmt->error");
                    }

                    $authResult = $stmt->get_result();
                    $authData = $authResult->fetch_all(MYSQLI_ASSOC);

                    $stmt->close();
                    $mysqli->close();

                    $errorOutput = 0;

                    if (isset($authData[0])) {
                        $rowResult = $authData[0];
                        $entered_password = $customs->password;
                        $stored_password = $rowResult['password_hash'];

                        if (password_verify($entered_password, $stored_password)) {
                            $_SESSION['auth_user_token'] = $rowResult['id_user'];

                            $sexClasses = [
                                1 => 'male',
                                2 => 'female',
                                3 => 'neutral'
                            ];

                            $userData = [
                                'token' => $rowResult['id_user'],
                                'login' => $rowResult['login'],
                                'sex' => $sexClasses[$rowResult['id_sex']]
                            ];

                            $_SESSION['auth_user'] = $userData;

                            echo json_encode($userData);
                        } else {
                            echo $errorOutput;
                        }
                    } else {
                        echo $errorOutput;
                    }
                } else {
                    die("Ошибка подготовки запроса: $stmt->error");
                }
            }
        }
    } else {
        die('Ошибка метода запроса');
    }
