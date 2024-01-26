<?php
    session_start();

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_once '../../access/access.php';

        /** @var $data */

        $mysqli = new mysqli(...$data);

        if ($mysqli->connect_error) {
            die("Ошибка подключения: $mysqli->connect_error");
        }

        $set = [];
        $s_array = ['s'];
        $files = $_FILES['avatar_file'];
        $path = '';
        $edit = $_POST;

        if (!empty($files['name'])) {
            $file_tmp = $files['tmp_name'];

            $unique_file_name = uniqid() . "_" . basename($files['name']);
            move_uploaded_file($file_tmp, "../../../src/img/avatars/{$unique_file_name}");

            $path = "src/img/avatars/$unique_file_name";
            $set['avatar'] = "avatar = '$path'";
        }

        foreach ($edit as $key => $value) {
            if ($value !== '') {
                $set[] = "$key = ?";
                $s_array[] = 's';
            }
        }

        $id_user = $_SESSION['auth_user_token'];
        $set_string = implode(', ', $set);
        $s_row = implode('', $s_array);

        $upd_query = "UPDATE users SET " . $set_string . " WHERE id_user = ?";

        if ($stmt = $mysqli->prepare($upd_query)) {
            $bindParams = [$s_row];

            foreach ($edit as $key => &$value) {
                if ($value !== '') {
                    $bindParams[] = &$value;
                }
            }

            $bindParams[] = &$id_user;

            call_user_func_array([$stmt, 'bind_param'], $bindParams);

            if (!$stmt->execute()) {
                die;
            }

            if ($path !== '') {
                $_SESSION['auth_user']['avatar'] = $path;
            }

            $stmt->close();
            $mysqli->close();
            echo json_encode(['status' => 'ok']);
        }
    }
