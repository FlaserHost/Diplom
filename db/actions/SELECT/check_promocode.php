<?php
    session_start();

    /** @var $data */

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['auth_user'])) {
        require_once '../../access/access.php';
        require_once '../../functions.php';

        $mysqli = new mysqli(...$data);

        if ($mysqli->connect_error) {
            die("Ошибка подключения: $mysqli->connect_error");
        }

        $promocode = json_decode(file_get_contents('php://input'));

        if ($promocode) {
            $request = "SELECT id_promocode, id_product, discount FROM promocodes WHERE promocode = ? AND CURDATE() >= start_date AND CURDATE() <= end_date";

            if ($stmt = $mysqli->prepare($request)) {
                $stmt->bind_param('s', $promocode->promocode);

                if ($stmt->execute()) {
                    $result = $stmt->get_result();
                    $response = $result->fetch_all(MYSQLI_ASSOC);

                    if ($response) {
                        $promoData = $response[0];
                        $promoID = $promoData['id_promocode'];
                        $userID = $_SESSION['auth_user']['token'];

                        $usedCheck = "SELECT id_row FROM used_promocodes WHERE id_promocode = ? AND id_user = ?";

                        if ($usedCheckStmt = $mysqli->prepare($usedCheck)) {
                            $usedCheckStmt->bind_param('is', $promoID, $userID);

                            if ($usedCheckStmt->execute()) {
                                $usedCheckResult = $usedCheckStmt->get_result();
                                $usedCheckResponse = $usedCheckResult->fetch_all(MYSQLI_ASSOC);

                                echo $usedCheckResponse
                                    ? json_encode(['status' => 'used']) // Вы уже использовали этот промокод.
                                    : json_encode(['status' => 'ok', ...$promoData]);

                                $usedCheckResult->close();
                                $usedCheckStmt->close();
                            } else {
                                die($usedCheckStmt->error);
                            }
                        } else {
                            die($usedCheckStmt->error);
                        }
                    } else {
                        echo json_encode(['status' => 'promocode_error']); // Либо такого промокода не существует, либо он вне срока действия
                    }

                    $stmt->close();
                    $result->close();
                    $mysqli->close();
                } else {
                    die($stmt->error);
                }
            } else {
                die($stmt->error);
            }
        } else {
            die;
        }
    } else {
        die;
    }
