<?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        /** @var $data */

        $searchData = json_decode(file_get_contents('php://input'));

        if ($searchData) {
            require_once '../../access/access.php';
            require_once '../../functions.php';

            $mysqli = new mysqli(...$data);

            if (!$mysqli->connect_error) {
                $category = $searchData->category;
                $product = "%$searchData->product%";

                $categoryFilter = $category !== '0';
                $filter = $categoryFilter ? "id_category = ? AND" : '';

                $searchResponse = "SELECT * FROM products WHERE $filter product_name LIKE ?";

                if ($stmt = $mysqli->prepare($searchResponse)) {
                    if ($categoryFilter) {
                        $stmt->bind_param('is', $category, $product);
                    } else {
                        $stmt->bind_param('s', $product);
                    }

                    if ($stmt->execute()) {
                        $result = $stmt->get_result();
                        $data = $result->fetch_all(MYSQLI_ASSOC);

                        $obj = [];

                        foreach ($data as $row) {
                            $rowData = [
                                'id_product' => $row['id_product'],
                                'name' => htmlspecialchars($row['product_name']),
                                'composition' => htmlspecialchars($row['product_composition']),
                                'weight' => htmlspecialchars($row['product_weight']),
                                'price' => htmlspecialchars($row['product_price']),
                                'photo' => htmlspecialchars($row['product_photo']),
                                'rating' => htmlspecialchars($row['product_rating'])
                            ];

                            $obj[] = $rowData;
                        }

                        echo json_encode($obj);
                    } else {
                        echo "Ошибка выполнения запроса $mysqli->error";
                    }

                    $stmt->close();
                } else {
                    echo "Ошибка запроса: $mysqli->error";
                }

                $mysqli->close();
            } else {
                echo "Ошибка подключения: $mysqli->connect_error";
            }
        } else {
            echo 'Данные не переданы';
        }
    } else {
        echo 'Ошибка. Неверный метод запроса.';
    }
