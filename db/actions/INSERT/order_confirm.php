<?php
    session_start();

    /** @var $data */

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($_POST['csrf_token'] === $_SESSION['csrf_tokens']['cart-modal']) {
            require_once '../../access/access.php';
            require_once '../../functions.php';

            $mysqli = new mysqli(...$data);

            if ($mysqli->connect_error) {
                die("Произошла ошибка подключения: $mysqli->connect_error");
            }

            $requiredKeys = [
                'firstname',
                'phone',
                'street',
                'house_number',
                'order_date',
                'client_agreed'
            ];

            $isValidPOST = POSTvalidator($requiredKeys);
            $completePOST = $isValidPOST['completePOST'];
            $problemField = $isValidPOST['problemField'];

            if ($completePOST) {
                $orderData = $_POST;
                $itemsIDs = explode(';', $orderData['itemsIDs']); // получение списка идентификаторов товаров
                $shippingDateTime = explode(' ', $orderData['order_date']); // разбиение значения дата/время

                $_SESSION['cartID'] = random_token();
                $cartID = $_SESSION['cartID'];

                $mysqli->begin_transaction();
                try {
                    $userID = $_SESSION['auth_user_token'] ?: null; // если пользователь авторизован, то использовать его токен, если нет, то null

                    // получение максимального значения для определения номера заказа
                    $requestMaxValue = "SELECT MAX(id_row) as max_value FROM order_full"; // SQL запрос
                    $getMaxValue = $mysqli->query($requestMaxValue); // выполнение запроса
                    $maxValue = $getMaxValue->fetch_assoc(); // получение результата выполнения запроса
                    $maxValue = $maxValue['max_value'] !== null ? ++$maxValue['max_value'] : 1; // если был хотя бы один заказ, то увеличить полученное значение на 1, иначе взять цифру 1 за номер заказа
                    $districtID = $orderData['hidden_district'] ?? null;
                    $promocode = $orderData['promocode'] ?? null;
                    $points_spent = $orderData['points_spent'] ?? null;
                    $points_rewarded = $orderData['points_rewarded'] ?? null;

                    // внесение данных по заказу в таблицу order_full
                    $query = "INSERT INTO order_full VALUES (NULL, LPAD('$maxValue', 7, '0'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())"; // SQL запрос

                    // проверяем факт подготовки запроса и успех
                    if ($stmt = $mysqli->prepare($query)) {
                        $stmt->bind_param(
                            'sssssiissiiisssiisiis', // s - string, i - integer
                            $cartID,
                            $userID,
                            $orderData['firstname'],
                            $orderData['phone'],
                            $orderData['email'],
                            $orderData['hidden_city'],
                            $districtID,
                            $orderData['street'],
                            $orderData['house_number'],
                            $orderData['entrance'],
                            $orderData['floor'],
                            $orderData['flat'],
                            $shippingDateTime[0],
                            $shippingDateTime[1],
                            $orderData['comment'],
                            $orderData['client_agreed'],
                            $orderData['final_cart_cost'],
                            $promocode,
                            $points_spent,
                            $points_rewarded,
                            $orderData['shipping_type']
                        ); // привязка параметров

                        if (!$stmt->execute()) {
                            throw new Exception("Ошибка выполнения запроса: $stmt->error"); // вывод пользовательской ошибки при неудаче выполнения запроса
                        }

                        $stmt->close();
                    } else {
                        throw new Exception("Ошибка подготовки запроса: $mysqli->error");
                    }

                    // заполняем таблицу tmp_order (хранилище идентификаторов корзин)
                    $fillCartRequest = "INSERT INTO tmp_order VALUES (NULL, ?, ?, ?, ?, ?, ?)";

                    // проверяем факт подготовки и успех
                    if ($fillStmt = $mysqli->prepare($fillCartRequest)) {
                        foreach ($itemsIDs as $itemID) {
                            $dataParse = explode(',', $itemID);

                            $fillStmt->bind_param('ssiiii', $cartID, $userID, $dataParse[0], $dataParse[1], $dataParse[2], $dataParse[3]);

                            if (!$fillStmt->execute()) {
                                throw new Exception("Ошибка выполнения запроса: $fillStmt->error");
                            }
                        }

                        $fillStmt->close();
                    }

                    // обновление остатка баллов
                    if ($userID !== null) {
                        $pointsUPDrequest = "UPDATE users SET points_remaining = ? WHERE id_user = ?";
                        if ($UPDstmt = $mysqli->prepare($pointsUPDrequest)) {

                            $newPointsValue = $orderData['points_remaining'] - $points_spent + $points_rewarded;

                            $UPDstmt->bind_param('is', $newPointsValue, $userID);

                            if (!$UPDstmt->execute()) {
                                throw new Exception("Ошибка выполнения обновления: $UPDstmt->error");
                            }

                            $_SESSION['auth_user']['points'] = $newPointsValue;
                            $UPDstmt->close();
                        } else {
                            throw new Exception("Ошибка подготовки обновления: $UPDstmt->error");
                        }

                        if ($promocode !== null) {
                            $getPromocodeID = "INSERT INTO used_promocodes VALUES (NULL, (SELECT id_promocode FROM promocodes WHERE promocode = ?), '$userID') ";

                            if ($promo_stmt = $mysqli->prepare($getPromocodeID)) {
                                $promo_stmt->bind_param('s', $promocode);

                                if (!$promo_stmt->execute()) {
                                    die;
                                }
                            }
                        }
                    }

                    $mysqli->commit();

                    $getMaxValue->close();
                    $mysqli->close();
                    unset($_SESSION['cartID'], $cartID);

                    echo 'Запись добавлена';
                } catch (Exception $e) {
                    $mysqli->rollback();
                    die("Ошибка: {$e->getMessage()}");
                }
            } else {
                die("Произошла ошибка. Переданы не все данные. Отсутствует: $problemField");
            }
        } else {
            die('Ошибка. Токен не верен');
        }
    } else {
        die('Переход по прямой ссылке запрещен');
    }
