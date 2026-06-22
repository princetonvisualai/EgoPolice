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

    $result = db_select(
        "SELECT video.name, user_video.label_group_idx FROM user_video
                INNER JOIN video ON user_video.video_idx=video.index
                INNER JOIN user ON user.index=user_video.user_idx
                    WHERE user.id=?", "s", $current_id);
    $row=mysqli_fetch_all($result,MYSQLI_ASSOC);

    echo json_encode(array('assignment' => $row));
?>