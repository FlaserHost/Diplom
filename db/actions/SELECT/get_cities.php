<?php
    require_once '../../access/access.php';

    /** @var $data */

    $mysqli = new mysqli(...$data);

    if ($mysqli->connect_error) {
        die('Ошибка подключения к базе данных: ' . $mysqli->connect_error);
    }

    $query = "SELECT * FROM cities";
    $queryResult = $mysqli->query($query);

    $jsonData = [];

    if ($queryResult) {
        $cities = $queryResult->fetch_all(MYSQLI_ASSOC);

        foreach ($cities as $city) {
            $id = $city['id_city'];
            $jsonData[$id] = htmlspecialchars($city['city']);
        }

        $queryResult->close();
        $mysqli->close();

        echo json_encode($jsonData);
    } else {
        die("Ошибка выполнения SQL-запроса: " . $mysqli->error);
    }
