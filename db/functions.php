<?php
    function random_token(): string {
        $symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@$%^&?=~#';
        return substr(str_shuffle($symbols), 0, 32);
    }

    /**
     * @throws Exception
     */
    function generateRandomBytes($bytes): string {
        return bin2hex(random_bytes($bytes));
    }

    function requestExecutor($connection, $request, $type, $id) {
        $rows = '';
        if ($smtp = $connection->prepare($request)) {
            $smtp->bind_param($type, $id);

            if ($smtp->execute()) {
                $result = $smtp->get_result();
                $rows = $result->fetch_all(MYSQLI_ASSOC);
            } else {
                die;
            }

            $smtp->close();
        }

        return $rows;
    }

    function POSTvalidator($requiredKeys): array {
        $result = [
            'completePOST' => true,
            'problemField' => ''
        ];

        foreach ($requiredKeys as $key) {
            if (empty($_POST[$key])) {
                $result['completePOST'] = false;
                $result['problemField'] = $key;
                break;
            }
        }

        return $result;
    }
