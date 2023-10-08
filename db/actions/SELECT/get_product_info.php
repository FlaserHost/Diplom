<?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        /** @var $data */

        $productData = json_decode(file_get_contents('php://input'));

        if ($productData) {
            require_once '../../access/access.php';
            require_once '../../functions.php';

            $mysqli = new mysqli(...$data);

            $id = $productData->id;

            $requests = [
                'product' => "SELECT * FROM products WHERE id_product = ?",
                'feedback' => "SELECT fb.*, users.*
                               FROM feedback as fb   
                               JOIN users ON fb.id_user = users.id_user
                               WHERE fb.id_product = ?"
            ];

            $results = [];
            foreach ($requests as $key => $request) {
                $results[$key] = requestExecutor($mysqli, $request, 'i', $id);
            }

            $mysqli->close();

            $productInfo = $results['product'][0];
            $merged = [
                'product' => [
                    'name' => htmlspecialchars($productInfo['product_name']),
                    'description' => htmlspecialchars($productInfo['product_description']),
                    'composition' => htmlspecialchars($productInfo['product_composition']),
                    'weight' => htmlspecialchars($productInfo['product_weight']),
                    'price' => htmlspecialchars($productInfo['product_price']),
                    'photo' => htmlspecialchars($productInfo['product_photo']),
                    'rating' => htmlspecialchars($productInfo['product_rating'])
                ],
            ];

            foreach ($results['feedback'] as $row) {
                $allInfo = [
                    'user' => [
                        'firstname' => htmlspecialchars($row['firstname']),
                        'id_sex' => htmlspecialchars($row['id_sex']),
                        'avatar' => $row['avatar']
                    ],
                    'feedback' => [
                        'feedback' => htmlspecialchars($row['feedback']),
                        'rating' => htmlspecialchars($row['feedback_rating']),
                        'datetime' => $row['feedback_datetime']
                    ],
                ];

                foreach ($allInfo as $key => $array) {
                    $merged[$key][] = $array;
                }
            }

            echo json_encode($merged);
        }
    } else {
        echo 'Ошибка. Неверный метод запроса.';
    }
