<?php
    require_once '../../access/access.php';

    /* @var $data */

    $mysqli = new mysqli(...$data);

    if ($mysqli->connect_error) {
        die("Ошибка подключения к базе данных: " . $mysqli->connect_error);
    }

    $query = "SELECT * FROM districts";
    $queryResult = $mysqli->query($query);

    $dataArray = [];

    if ($queryResult) {
        $districts = $queryResult->fetch_all(MYSQLI_ASSOC);

        foreach ($districts as $district) {
            $id = $district['id_district'];
            $dataArray[$id] = $district['district'];
        }

        $queryResult->free();
        $mysqli->close();

        echo json_encode($dataArray);
    } else {
        die("Ошибка выполнения SQL-запроса: " . $mysqli->error);
    }
