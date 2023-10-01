<?php
    function random_token() {
        $symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@$%^&?=~#';
        return substr(str_shuffle($symbols), 0, 32);
    }

    function generateCSRFToken() {
        return bin2hex(random_bytes(32));
    }

    function requestExecutor($connection, $request, $type, $id) {
        $rows = '';
        if ($smtp = $connection->prepare($request)) {
            $smtp->bind_param($type, $id);

            if ($smtp->execute()) {
                $result = $smtp->get_result();
                $rows = $result->fetch_all(MYSQLI_ASSOC);
            }

            $smtp->close();
        }

        return $rows;
    }
