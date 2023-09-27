<?php
    session_start();

    /** @var $data */

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($_POST['csrf_token'] === $_SESSION['csrf_tokens']['cart-modal']) {
            require_once '../../access/access.php';
            require_once '../../functions.php';

            $mysqli = new mysqli(...$data);

            if ($mysqli->connect_error) {
                die("Произошла ошибка подключения: {$mysqli->connect_error}");
            }

            $completePOST = true;
            $problemField = '';
            foreach ($_POST as $key => $value) {
                if (!isset($value)) {
                    $completePOST = false;
                    $problemField = $key;
                    break;
                }
            }

            if ($completePOST) {
                $orderData = $_POST;
                $itemsIDs = explode(',', $orderData['itemsIDs']);

                $_SESSION['cartID'] = random_token();
                $cartID = $_SESSION['cartID'];

                $mysqli->begin_transaction();
                try {
                    $userID = isset($_SESSION['auth_user_token']) ?: $_SESSION['guest_user_token'];
                    
                    $requestMaxValue = "SELECT MAX(id_row) as max_value FROM order_full";
                    $getMaxValue = $mysqli->query($requestMaxValue);
                    $maxValue = $getMaxValue->fetch_assoc();
                    $maxValue = $maxValue['max_value'] !== null ? ++$maxValue['max_value'] : 1;

                    $query = "INSERT INTO order_full VALUES (NULL, LPAD('$maxValue', 7, '0'), ?, ?, ?, NOW())";

                    if ($stmt = $mysqli->prepare($query)) {
                        $stmt->bind_param('ssi', $cartID, $userID, $orderData['final_cart_cost']);

                        if (!$stmt->execute()) {
                            throw new Exception("Ошибка выполнения запроса: {$stmt->error}");
                        }

                        $stmt->close();
                    } else {
                        throw new Exception("Ошибка подготовки запроса: {$mysqli->error}");
                    }

                    $mysqli->commit();

                    $getMaxValue->free();
                    $mysqli->close();
                    unset($_SESSION['cartID'], $cartID);

                    echo 'Запись добавлена';
                } catch (Exception $e) {
                    $mysqli->rollback();
                    die("Ошибка: {$e->getMessage()}");
                }
            } else {
                die("Произошла ошибка. Переданы не все данные. Отсутствует: {$problemField}");
            }
        } else {
            die('Ошибка. Токен не верен');
        }
    } else {
        die('Переход по прямой ссылке запрещен');
    }
