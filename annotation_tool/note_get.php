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

  $result=mysqli_fetch_assoc(db_select("SELECT note FROM `user` WHERE id=?", "s", $current_id));

  echo $result['note'];
?>
