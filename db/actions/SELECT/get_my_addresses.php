<?php
    session_start();

    if (isset($_SESSION['auth_user'])) {
        /** @var $data */

        require_once '../../access/access.php';

        $mysqli = new mysqli(...$data);

        if ($mysqli->connect_error) {
            die("Ошибка подключения: $mysqli->connect_error");
        }

        $user_id = $_SESSION['auth_user']['token'];
        $getAddresses = "SELECT usadr.*, cities.city as city, districts.district as district
                         FROM user_addresses as usadr
                         JOIN cities ON usadr.id_city = cities.id_city
                         LEFT JOIN districts ON usadr.id_district = districts.id_district                 
                         WHERE user_id = ?";

        if ($stmt = $mysqli->prepare($getAddresses)) {
            $stmt->bind_param('s', $user_id);

            if (!$stmt->execute()) {
                die("Ошибка выполнения запроса: $stmt->error");
            }

            $result = $stmt->get_result();
            $response = $result->fetch_all(MYSQLI_ASSOC);

            $stmt->close();
            $mysqli->close();

            $addresses = [];
            foreach ($response as $address) {
                $addressRow = [
                    'label' => htmlspecialchars($address['label']),
                    'details' => [
                        1 => [
                            htmlspecialchars($address['city']),
                            $address['id_city']
                        ],
                        2 => ['Нет районов', ''],
                        3 => htmlspecialchars($address['street']),
                        4 => htmlspecialchars($address['house_number']),
                        5 => $address['flat'] ? htmlspecialchars($address['flat']) : '',
                        6 => $address['entrance'] ? htmlspecialchars($address['entrance']) : '',
                        7 => $address['floor'] ? htmlspecialchars($address['floor']) : ''
                    ]
                ];

                if ($address['id_district'] !== null) {
                    $addressRow['details'][2] = [
                        htmlspecialchars($address['district']),
                        $address['id_district']
                    ];
                }

                $addresses[] = $addressRow;
            }

            echo json_encode($addresses);
        } else {
            die("Ошибка подготовки запроса: $stmt->error");
        }
    } else {
        die;
    }
