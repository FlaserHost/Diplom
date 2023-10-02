<?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        /** @var $data */

        $productData = json_decode(file_get_contents("php://input"));

        if ($productData) {
            require_once '../../access/access.php';
            require_once '../../functions.php';

            $mysqli = new mysqli(...$data);

            $id = $productData->id;

            $requests = [
                'product' => "SELECT * FROM products WHERE id_product = ?",
                'feedback' => "SELECT * FROM feedback WHERE id_product = ?"
            ];

            $results = [];
            $product = [];
            $feedback = [];
            $users = [];

            foreach ($requests as $request) {
                $results[] = requestExecutor($mysqli, $request, 'i', $id);
            }

            $requestUser = "SELECT firstname, avatar FROM users WHERE id_user = ?";
            foreach ($results[1] as $row) {
                $rowData = [
                    'feedback' => htmlspecialchars($row['feedback']),
                    'id_user' => htmlspecialchars($row['id_user']),
                    'rating' => htmlspecialchars($row['rating']),
                    'datetime' => $row['feedback_datetime']
                ];

                $feedback['feedback'][] = $rowData;

                $userData = requestExecutor($mysqli, $requestUser, 's', $row['id_user']);
                foreach ($userData as $user) {
                    $userRow = [
                        'firstname' => htmlspecialchars($user['firstname']),
                        'avatar' => htmlspecialchars($user['avatar'])
                    ];

                    $users['user'][] = $userRow;
                }
            }

            $mysqli->close();

            foreach ($results[0] as $row) {
                $rowData = [
                    'name' => htmlspecialchars($row['product_name']),
                    'description' => htmlspecialchars($row['product_description']),
                    'composition' => htmlspecialchars($row['product_composition']),
                    'weight' => htmlspecialchars($row['product_weight']),
                    'price' => htmlspecialchars($row['product_price']),
                    'photo' => htmlspecialchars($row['product_photo']),
                    'rating' => htmlspecialchars($row['product_rating'])
                ];

                $product['info'][] = $rowData;
            }

            $obj = [...$product, ...$feedback, ...$users];
            echo json_encode($obj);
        }
    }
