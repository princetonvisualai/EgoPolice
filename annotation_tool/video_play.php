<?php
   ob_start();
   session_start();

   require_once './util.php';
   require_once './conn.php';
  //  error_reporting(E_ALL);
  //  ini_set("display_errors", 1);

   $id = get_session_id();
   if (!$id){
      header("location: login.php");
      exit;
   }

   $videoId = htmlspecialchars($_GET["videoId"]) ;
   
   if ($id == 'admin'){
       $result = db_select(
           "SELECT video.index, video.name, video.webp_location, video.mp4_location, video.second, video.original, video.start_time, video.end_time FROM video
                 WHERE video.name=?", "s", $videoId);
       $row=mysqli_fetch_all($result,MYSQLI_ASSOC);
   } else {

       $result = db_select(
           "SELECT video.index, video.name, video.webp_location, video.mp4_location, video.second, video.original, video.start_time, video.end_time FROM user
                 INNER JOIN user_video ON user_video.user_idx=user.index
                 INNER JOIN video ON user_video.video_idx=video.index  WHERE user.id=? AND video.name=?", "ss", $id, $videoId);
       $row=mysqli_fetch_all($result,MYSQLI_ASSOC);
   }
   

   if(mysqli_num_rows($result) == 1)
   {
     $video_cnt = $row[0]['second'];
     $mp4_loc = $row[0]['mp4_location'];
     $webp_loc = $row[0]['webp_location'];
     $original = $row[0]['original'];
     $start_time = $row[0]['start_time'];
     $end_time = $row[0]['end_time'];

   } else {
      header("location: index.php");
      exit;
   }
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0" />
  <title>Annotation Tool</title>

  <!-- CSS  -->
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="manifest" href="/site.webmanifest">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link href="css/materialize.css" type="text/css" rel="stylesheet" media="screen,projection" />
  <link href="css/style.css" type="text/css" rel="stylesheet" media="screen,projection" />
  <script src="/extras/video.js"></script>
  <link href="css/video-js.css" rel="stylesheet" />
  <script src="/extras/videojs-abloop.min.js" ></script>
  <link href="css/label.css" rel="stylesheet"></link>
</head>
<body>
  
    <div class='videobox'>
      <video id="vid" controls class="video-js" muted>
        <source src="https://vjs.zencdn.net/v/oceans.mp4" type='video/mp4'>
      </video>
    </div>
  <script>
  
  let mp4_loc = '<?= $mp4_loc; ?>';
  let start_time = '<?= $start_time; ?>';
  let end_time = '<?= $end_time; ?>';
  let original = '<?= $original; ?>';
  
  </script>
  <!--  Scripts-->
  <script src="/extras/jquery-2.1.1.min.js"></script>
  <script src="/extras/materialize.js"></script>
  <script src='js/video_play.js'></script>

</body>

</html>