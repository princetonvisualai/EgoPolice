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

    $group_index = $_POST['group_index'];

    $result=db_select("SELECT user_video.user_idx, user.id  FROM user_video INNER JOIN user ON user.index=user_video.user_idx WHERE `label_group_idx`=?", "i", $group_index);
    $row=mysqli_fetch_all($result,MYSQLI_ASSOC);

    if(mysqli_num_rows($result) > 0) {
        echo "There is a user assigned to this label group. ID: ".$row[0]['id'];
    } else {
        db_exec("DELETE `label_group`, `label` FROM label_group LEFT JOIN label ON label.index=label_group.label_index WHERE group_index=?", "i", $group_index);
        echo "Removed successfully.\n";
    }


?>