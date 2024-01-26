<?php
    session_start();
    unset($_SESSION['auth_user']);
    echo json_encode(['status' => 'ok']);
