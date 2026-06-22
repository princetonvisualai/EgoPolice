  <?php
  ob_start();
  session_start();

  // error_reporting(E_ALL);
  // ini_set("display_errors", 1);

  require_once './util.php';
  require_once './conn.php';

  // check if session exists. I.e., is it logged in?
  $id = get_session_id();
  if (!$id){
    header("location: login.php");
    exit;
  } elseif ($id=="admin") {
      header("location: manage.php");
    exit;
  }

  $result = db_select(
      "SELECT video.index, video.name, video.description, video.second, video.webp_location, user_video.index AS user_video_index FROM user
              INNER JOIN user_video ON user_video.user_idx=user.index
              INNER JOIN video ON user_video.video_idx=video.index WHERE user.id=?", "s", $id);
  $row_video=mysqli_fetch_all($result,MYSQLI_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0" />
  <title>Annotation Tool</title>

  <!-- CSS  -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link href="/css/materialize.css" type="text/css" rel="stylesheet" media="screen,projection" />
  <link href="css/index.css" type="text/css" rel="stylesheet" />
  <style>
  </style>
    
</head>

<body>

   <a class='btn' href = "logout.php">Log Out</a>
  <div class="container">
   <h3>Among <?= mysqli_num_rows($result); ?> videos, you annotated <span id='annotate_cnt'><?= 0; ?></span>, and skipped <span id='skipped_cnt'><?= 0; ?></span>.</h3>
    
   <?php foreach($row_video as $key=>$value): ?>
      <div class='row singlerow' id='<?= $value['user_video_index']; ?>'> 
       <a name='<?= $value['name']; ?>'></a>
       <div class='col m2 s2 xl1 leftdiv'>
         <div class='number'><?= $key +1; ?></div>
         <div class='colorbar' style='background:red'></div>
         <div class='videostatus'>❌</div>
        </div>
        
        <?php 
              $result = db_select(
              "SELECT DISTINCT(label_group.name) FROM label_group
              INNER JOIN user_video ON user_video.label_group_idx=label_group.group_index
              WHERE user_video.index=?", "i", $value['user_video_index']);
              $row=mysqli_fetch_all($result,MYSQLI_ASSOC);
          ?>
        <div class='col m4 s9 xl3 buttondiv'>
            <button onclick="onButton(this)" class='btn'>Annotate</button>
        </div>
        <div class='col m4 xl8 hide-on-small-only titlediv'>

              
          <p><strong style='font-weight: bolder'>video</strong>: <?= $value['name']; ?> <strong style='font-weight: bolder'>label</strong>: <?= $row[0]['name']; ?></p>
        </div>
      </div>
   <?php endforeach; ?>
  </div>

  <!--  Scripts-->
  <script>
    var videos = <?= json_encode($row_video) ?>;
  </script>
  <script src="/extras/jquery-2.1.1.min.js"></script>
  <script src="/extras/materialize.js"></script>
  <script src='js/index.js'></script>
</body>

</html>
