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
  $newid = $_POST['newid'];

  if (strlen($newid) == 0){
    echo 'newid is empty';
  }
  if (!ctype_alnum($newid)){
    echo 'newid is not alphanumeric';
  }

  $result=db_select("SELECT id FROM user WHERE `id`=?", "s", $newid);
  if(mysqli_num_rows($result) == 1)
  {
    echo 'existing ID';
  }
  else {
    db_exec("UPDATE `user` SET `id`=? WHERE `id`=?", "ss", $newid, $current_id);

    echo 1;
  }
?>
