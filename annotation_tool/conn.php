<?php
    // Load local configuration (DB credentials, paths). See config.example.php.
    $config_path = __DIR__ . '/config.php';
    if (!file_exists($config_path)) {
        http_response_code(500);
        exit('Missing config.php. Copy config.example.php to config.php and fill it in.');
    }
    $config = require $config_path;

    // Show errors only in development; otherwise log them.
    if (!empty($config['debug'])) {
        error_reporting(E_ALL);
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
    } else {
        error_reporting(E_ALL);
        ini_set('display_errors', 0);
        ini_set('display_startup_errors', 0);
    }

    global $connect;
    $connect = mysqli_connect($config['db_host'], $config['db_user'], $config['db_pass']);
    if (!$connect) {
        error_log('Database connection failed: ' . mysqli_connect_error());
        http_response_code(500);
        exit("Error: couldn't connect to the database.");
    }
    mysqli_select_db($connect, $config['db_name']);

    // Prepared-statement helpers. Always use ? placeholders and pass a type
    // string ('s' string, 'i' int, 'd' double) plus the values. Never
    // interpolate request data directly into SQL.
    function db_select($sql, $types = '', ...$params) {
        global $connect;
        $stmt = mysqli_prepare($connect, $sql);
        if ($types !== '') {
            mysqli_stmt_bind_param($stmt, $types, ...$params);
        }
        mysqli_stmt_execute($stmt);
        return mysqli_stmt_get_result($stmt);
    }

    function db_exec($sql, $types = '', ...$params) {
        global $connect;
        $stmt = mysqli_prepare($connect, $sql);
        if ($types !== '') {
            mysqli_stmt_bind_param($stmt, $types, ...$params);
        }
        mysqli_stmt_execute($stmt);
        return $stmt;
    }
?>
