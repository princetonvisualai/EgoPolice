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

  if (empty($_GET['index'])) { 
    
    echo "It's Empty!!!"; 
  
  }
  else {
    $index = mysqli_real_escape_string($connect, $_GET['index']);

    $sql="SELECT A.name, A.mp4_location, A.second, A.start_time, A.end_time, A.index, B.name AS original_name
    FROM video A, video B 
    WHERE A.original=0 AND A.original_index=B.index";
    $result=mysqli_query($connect,$sql);
    $row_videos_partial=mysqli_fetch_all($result,MYSQLI_ASSOC);
  
    echo json_encode($row_videos_partial);
  }
  

  
?>
