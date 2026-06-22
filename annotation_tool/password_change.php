<?php
  ob_start();
  session_start();

  error_reporting(E_ALL);
  ini_set("display_errors", 1);
  ini_set('display_startup_errors', 1);

  require_once './util.php';
  require_once './conn.php';

  $id = get_session_id();
  if (!$id){
      header("location: login.php");
      exit;
  } elseif ($id!="admin") {
      header("location: index.php");
      exit;
  }

  $current_id = $_POST['id'];
  $password = $_POST['password'];

  if (strlen($password) == 0){
    throw new Exception('password is empty');
  }

  $hash = password_hash($password,  PASSWORD_DEFAULT);

  db_exec("UPDATE `user` SET `password`=? WHERE `id`=?", "ss", $hash, $current_id);

  echo 1;
?>
