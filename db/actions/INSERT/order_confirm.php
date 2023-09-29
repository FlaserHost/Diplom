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

            $requiredKeys = [
                'firstname',
                'phone',
                'street',
                'house_number',
                'order_date',
                'client_agreed'
            ];

            $completePOST = true;
            $problemField = '';
            foreach ($requiredKeys as $key) {
                if (empty($_POST[$key])) {
                    $completePOST = false;
                    $problemField = $key;
                    break;
                }
            }

            if ($completePOST) {
                $orderData = $_POST;
                $itemsIDs = explode(',', $orderData['itemsIDs']); // получение списка идентификаторов товаров
                $shippingDateTime = explode(' ', $orderData['order_date']); // разбиение значения дата/время

                $_SESSION['cartID'] = random_token();
                $cartID = $_SESSION['cartID'];

                $mysqli->begin_transaction();
                try {
                    $userID = isset($_SESSION['auth_user_token']) ?: null; // если пользователь авторизоваан, то использовать его токен, если нет, то null

                    // получение максимального значения для определения номера заказа
                    $requestMaxValue = "SELECT MAX(id_row) as max_value FROM order_full"; // SQL запрос
                    $getMaxValue = $mysqli->query($requestMaxValue); // выполнение запроса
                    $maxValue = $getMaxValue->fetch_assoc(); // получение результата выполнения запроса
                    $maxValue = $maxValue['max_value'] !== null ? ++$maxValue['max_value'] : 1; // если был хотя бы один заказ, то увеличить полученное значение на 1, иначе взять цифру 1 за номер заказа

                    // внесение данных по заказу в таблицу order_full
                    $query = "INSERT INTO order_full VALUES (NULL, LPAD('$maxValue', 7, '0'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())"; // SQL запрос

                    // проверяем факт подготовки запроса и успех
                    if ($stmt = $mysqli->prepare($query)) {
                        $stmt->bind_param(
                            'sssssiissiisssiis', // s - string, i - integer
                            $cartID,
                            $userID,
                            $orderData['firstname'],
                            $orderData['phone'],
                            $orderData['email'],
                            $orderData['hidden_city'],
                            $orderData['hidden_district'],
                            $orderData['street'],
                            $orderData['house_number'],
                            $orderData['entrance'],
                            $orderData['flat'],
                            $shippingDateTime[0],
                            $shippingDateTime[1],
                            $orderData['comment'],
                            $orderData['client_agreed'],
                            $orderData['final_cart_cost'],
                            $orderData['shipping_type']
                        ); // привязка параметров

                        if (!$stmt->execute()) {
                            throw new Exception("Ошибка выполнения запроса: {$stmt->error}"); // вывод пользовательской ошибки при неудаче выполнения запроса
                        }

                        $stmt->close();
                    } else {
                        throw new Exception("Ошибка подготовки запроса: {$mysqli->error}");
                    }

                    // заполняем таблицу tmp_order (хранилище идентификаторов корзин)
                    $fillCartRequest = "INSERT INTO tmp_order VALUES (NULL, ?, ?, ?)";

                    // проверяем факт подготовки и успех
                    if ($fillStmt = $mysqli->prepare($fillCartRequest)) {
                        foreach ($itemsIDs as $itemID) {
                            $fillStmt->bind_param('ssi', $cartID, $userID, $itemID);

                            if (!$fillStmt->execute()) {
                                throw new Exception("Ошибка выполнения запроса: {$fillStmt->error}");
                            }
                        }

                        $fillStmt->close();
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
