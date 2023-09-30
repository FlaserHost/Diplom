<?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        /** @var $data */

        $productData = json_decode(file_get_contents("php://input"));

        if ($productData) {
            require_once '../../access/access.php';
            require_once '../../functions.php';

            $mysqli = new mysqli(...$data);

            $id = $productData->id;

            $requestProductInfo = "SELECT * FROM products WHERE id_product = ?";
            $requestFeedback = "SELECT * FROM feedback WHERE id_product = ?";

            $requests = [
                'product' => "SELECT * FROM products WHERE id_product = ?",
                'feedback' => "SELECT * FROM feedback WHERE id_product = ?"
            ];

            $results = [];
            $product = [];
            $feedback = [];

            foreach ($requests as $request) {
                $results[] = requestExecutor($mysqli, $request, $id);
            }

            $mysqli->close();

            foreach ($results[0] as $row) {
                $product = [
                    'name' => $row['product_name'],
                    'description' => $row['product_description'],
                    'composition' => $row['product_composition'],
                    'weight' => $row['product_weight'],
                    'price' => $row['product_price'],
                    'photo' => $row['product_photo']
                ];
            }

            foreach ($results[1] as $row) {
                $rowData = [
                    'feedback' => $row['feedback'],
                    'id_user' => $row['id_user'],
                ];

                $feedback['feedback'][] = $rowData;
            }

            $obj = [...$product, ...$feedback];
            echo json_encode($obj);
        }
    }
