<?php
    function random_token() {
        $symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@$%^&?=~#';
        return substr(str_shuffle($symbols), 0, 32);
    }

    function generateCSRFToken() {
        return bin2hex(random_bytes(32));
    }
