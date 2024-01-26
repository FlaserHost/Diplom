<?php
    session_start();
    require_once '../../access/access.php';

    /* @var $data */

    $mysqli = new mysqli(...$data);

    $postData = json_decode(file_get_contents('php://input'));

    if ($postData) {
        $productId = $postData->id;
        $userId = $_SESSION['auth_user']['token'];

        $checkFeedback = "SELECT COUNT(id_feedback) as feedback_exist FROM feedback WHERE id_product = ? AND id_user = ?";
        if ($smtp = $mysqli->prepare($checkFeedback)) {
            $smtp->bind_param('is', $productId, $userId);

            if (!$smtp->execute()) {
                die;
            }

            $result = $smtp->get_result();
            $amount = $result->fetch_all(MYSQLI_ASSOC);

            echo json_encode(['amount' => $amount[0]['feedback_exist']]);
        }
    } else {
        die;
    }
