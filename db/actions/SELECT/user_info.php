<?php
    session_start();

    /** @var $data */

    $customs = json_decode(file_get_contents('php://input'));

    if ($customs) {
        $token = $customs->csrf_token;

        if ($token === $_SESSION['csrf_tokens']['user-profile-modal']) {
            if (isset($_SESSION['auth_user'])) {
                require_once '../../access/access.php';
                require_once '../../functions.php';

                $mysqli = new mysqli(...$data);

                if ($mysqli->connect_error) {
                    die("Ошибка подключения: $mysqli->connect_error");
                }

                $userID = $_SESSION['auth_user']['token'];

                $infoRequest = "SELECT login, firstname, users.id_sex, users.points_remaining, sx.sex as sex, phone, email, avatar FROM users
                            JOIN sex as sx ON users.id_sex = sx.id_sex
                            WHERE id_user = ?";

                if ($stmt = $mysqli->prepare($infoRequest)) {
                    $stmt->bind_param('s', $userID);

                    if ($stmt->execute()) {
                        $result = $stmt->get_result();
                        $response = $result->fetch_all(MYSQLI_ASSOC);
                        $info = $response[0];

                        $stmt->close();
                        $mysqli->close();

                        $userInfo = [
                            'login' => $info['login'],
                            'firstname' => $info['firstname'],
                            'sex' => $info['sex'],
                            'phone' => $info['phone'],
                            'email' => $info['email'],
                            'id_sex' => $info['id_sex'],
                            'points_remaining' => $info['points_remaining'],
                            'avatar' => $info['avatar']
                        ];

                        echo json_encode($userInfo);
                    } else {
                        die("Ошибка выполнения запроса: $stmt->error");
                    }
                } else {
                    die("Ошибка подготовки запроса: $stmt->error");
                }
            } else {
                die;
            }
        } else {
            die('Неверный токен');
        }
    } else {
        die('Токен не передан');
    }
