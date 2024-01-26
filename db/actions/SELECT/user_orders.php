<?php
    session_start();

    require_once '../../access/access.php';

    /** @var $data */

    $mysqli = new mysqli(...$data);

    if ($mysqli->connect_error) {
        die;
    }

    $user_id = $_SESSION['auth_user_token'];

    $getCartsID = "SELECT id_cart, order_number, order_date, order_cost FROM order_full WHERE id_user = '$user_id'";
    $result = $mysqli->query($getCartsID);

    $pivot_array = [];

    if ($result) {
        $resultAssoc = $result->fetch_all(MYSQLI_ASSOC);

        foreach ($resultAssoc as $order) {
            $id_value = $order['id_cart'];
            $order_number = $order['order_number'];
            $order_date = $order['order_date'];
            $order_cost = $order['order_cost'];

            $pivot_array[$order_number]['order_date'] = $order_date;
            $pivot_array[$order_number]['order_cost'] = $order_cost;

            $selectItemsQuery = "SELECT id_product, product_amount, product_old_price FROM tmp_order WHERE id_user = '$user_id' AND id_cart = '$id_value'";
            $resultSelect = $mysqli->query($selectItemsQuery);

            if ($resultSelect) {
                $selectAssoc = $resultSelect->fetch_all(MYSQLI_ASSOC);

                foreach ($selectAssoc as $id) {
                    $id_product = $id['id_product'];
                    $product_old_price = $id['product_old_price'];
                    $product_amount = $id['product_amount'];

                    $getProducts = "SELECT id_product, product_name, product_composition, product_price, product_photo FROM products WHERE id_product = $id_product";
                    $productResult = $mysqli->query($getProducts);

                    if ($productResult) {
                        $productAssoc = $productResult->fetch_all(MYSQLI_ASSOC);

                        if ($productAssoc[0]['id_product'] === $id_product) {
                            $productAssoc[0]['old_price'] = $product_old_price;
                            $productAssoc[0]['product_amount'] = $product_amount;
                            $productAssoc[0]['product_cost'] = $productAssoc[0]['product_price'] * $product_amount;
                        }

                        $pivot_array[$order_number]['items'][] = $productAssoc;
                    }
                }

                $resultSelect->close();
            }
        }

        $mysqli->close();
        echo json_encode($pivot_array);
    }
