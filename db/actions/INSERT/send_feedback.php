<?php
    session_start();

    /** @var $data */

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_once '../../access/access.php';
        $feedback = json_decode(file_get_contents('php://input'));

        if ($feedback) {
            $text = $feedback->my_feedback_text;
            $userId = $_SESSION['auth_user']['token'];
            $productId = (int) $feedback->product_id;
            $rate = (int) $feedback->my_feedback_rate;

            $mysqli = new mysqli(...$data);

            $mysqli->begin_transaction();
            try {
                $sendRequest = "INSERT INTO feedback VALUES(NULL, ?, ?, ?, ?, NOW())";
                if ($stmtFeedback = $mysqli->prepare($sendRequest)) {
                    $stmtFeedback->bind_param('ssii',
                        $text,
                        $userId,
                        $productId,
                        $rate
                    );

                    if (!$stmtFeedback->execute()) die;
                } else {
                    die;
                }

                $rates = "SELECT SUM(feedback_rating) as rates_sum, COUNT(feedback_rating) as rates_amount FROM feedback WHERE id_product = ?";
                if ($stmtRates = $mysqli->prepare($rates)) {
                    $stmtRates->bind_param('i', $productId);

                    if (!$stmtRates->execute()) {
                        die;
                    }

                    $ratesResult = $stmtRates->get_result();
                    $ratesAssocArray = $ratesResult->fetch_all(MYSQLI_ASSOC);

                    $ratesSum = $ratesAssocArray[0]['rates_sum'];
                    $ratesAmount = $ratesAssocArray[0]['rates_amount'];

                    $totalRate = round($ratesSum / $ratesAmount, 1);

                    $updateRateRequest = "UPDATE products SET product_rating = ? WHERE id_product = ?";
                    if ($stmtUPDRate = $mysqli->prepare($updateRateRequest)) {
                        $stmtUPDRate->bind_param('di', $totalRate, $productId);

                        if (!$stmtUPDRate->execute()) {
                            die;
                        }

                        echo json_encode(['status' => 'ok']);
                    } else {
                        die;
                    }
                } else {
                    die;
                }

                $mysqli->commit();
            } catch (Exception $e) {
                $mysqli->rollback();
                die("Ошибка: {$e->getMessage()}");
            }
        }
    } else {
        die;
    }
