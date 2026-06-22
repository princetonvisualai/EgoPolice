<?php
    ob_start();
    session_start();

    error_reporting(E_ALL);
    ini_set("display_errors", 1);

    require_once './util.php';
    require_once './conn.php';

    // check if session exists. I.e., is it logged in?
    $id = get_session_id();
    if (!$id){
        header("location: login.php");
        exit;
    } elseif ($id!="admin") {
        header("location: index.php");
        exit;
    }

    $video_idx = $_POST['index'];

    $result=db_select("SELECT `user_idx` FROM user_video WHERE `video_idx`=?", "i", $video_idx);
    $row=mysqli_fetch_all($result,MYSQLI_ASSOC);
    if(mysqli_num_rows($result) > 0) {
        echo "There is a user assigned to this video. user_idx:".$row[0]['user_idx'];
    } else {
        db_exec("DELETE FROM `video` WHERE `index`=?", "i", $video_idx);
        echo "Removed successfully.\n";
    }


?>

<?
  // error_reporting(E_ALL);
  //  ini_set("display_errors", 1);
?>