<?php

session_start();

// clear and destroy the server-side session
$_SESSION = array();
session_destroy();

// clear any leftover cookies from the old auth scheme
setcookie("username", "", time() - 3600);
setcookie("hash", "", time() - 3600);

header("location: login.php");

?>
