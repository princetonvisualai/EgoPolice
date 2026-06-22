
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

  $sql="SELECT MAX(`index`) FROM user;";
  $result=mysqli_fetch_assoc(mysqli_query($connect,$sql));

  $num =$result['MAX(`index`)'];

  $newid = "annotator".($num+1);


  db_exec("INSERT INTO user (id, password, role) VALUES (?, 'hi', 'annotator')", "s", $newid);

  echo $newid;
?>
