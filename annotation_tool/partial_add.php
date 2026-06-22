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

    
    foreach ($_POST['videos'] as $video){


        // check if newid is not unique
        $result=db_select("SELECT `name` FROM video WHERE `name`=?", "s", $video['newid']);
        if(mysqli_num_rows($result) > 0) {
            echo $video['newid']." already exists.\n";
            continue;
        }

        // check if original id exists
        $result=db_select("SELECT `index` ,`second`, `webp_location`, `mp4_location` FROM video WHERE `name`=? and `original`=1", "s", $video['vid']);
        if(mysqli_num_rows($result) == 0) {
            echo $video['vid']." does not exists as a original video.\n";
            continue;
        }
        $row=mysqli_fetch_all($result,MYSQLI_ASSOC);

        // time to add!
        if ($row[0]['second']-1 < $video['end']){
            $video['end'] = $row[0]['second']-1;
        }
        if ($video['end'] < $video['start']){
            echo $video['newid']." end is faster than start.\n";
            continue;
        }

        $webp_location = $row[0]['webp_location'];
        $mp4_location = $row[0]["mp4_location"];
        $second =$video['end']-$video['start']+1;
        $starttime = $video['start'];
        $endtime = $video['end'];
        $originalindex = $row[0]['index'];
        

        db_exec("INSERT INTO video (`name`, `webp_location`, `mp4_location`, `second`, `original`, `start_time`, `end_time`, `original_index`) VALUES (?, ?, ?, ?, 0, ?, ?, ?)",
            "sssiiii", $video['newid'], $webp_location, $mp4_location, $second, $starttime, $endtime, $originalindex);
        echo $video['newid']." added successfully.\n";
    }

   



?>

<?
  // error_reporting(E_ALL);
  //  ini_set("display_errors", 1);
?>