<?php
    ob_start();
    session_start();

    error_reporting(E_ALL);
    ini_set("display_errors", 1);
    require_once './util.php';
    require_once './conn.php';

    $id = get_session_id();
    if (!$id){
        header("location: login.php");
      exit;
    }

    $user_video_index = htmlspecialchars($_GET["id"]) ;

    $result = db_select(
        "SELECT video.name, video.webp_location, video.mp4_location, video.second, video.original, video.original_index, video.start_time, video.end_time FROM user
                INNER JOIN user_video ON user_video.user_idx=user.index
                INNER JOIN video ON user_video.video_idx=video.index WHERE user.id=? AND user_video.index=?", "ss", $id, $user_video_index);
    $row=mysqli_fetch_all($result,MYSQLI_ASSOC);

    if(mysqli_num_rows($result) == 1)
    {
     $name = $row[0]['name'];
     $video_cnt = $row[0]['second'];
     $mp4_loc = $row[0]['mp4_location'];
     $webp_loc = $row[0]['webp_location'];
     $original = $row[0]['original'];
     $start_time = $row[0]['start_time'];
     $end_time = $row[0]['end_time'];
    } else {
        header("location: index.php");
    }

    if ($original == 0){
      $original_index = $row[0]['original_index'];
      $result = db_select("SELECT video.name FROM video WHERE video.index=?", "i", $original_index);
      $row=mysqli_fetch_all($result,MYSQLI_ASSOC);
      $original_name = $row[0]['name'];
    } else {
      $original_name = $name;
    }

    $result = db_select(
        "SELECT label.index, label.description, label.entity, label.name, label.order, label.skip, label.under, label.explicit FROM user_video
                INNER JOIN label_group ON label_group.group_index=user_video.label_group_idx
                INNER JOIN user on user.index=user_video.user_idx
                INNER JOIN label ON label_group.label_index=label.index WHERE user_video.index=?", "s", $user_video_index);
    $row=mysqli_fetch_all($result,MYSQLI_ASSOC);
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
  <link href="/css/materialize.css" type="text/css" rel="stylesheet" media="screen,projection" />
  <link href="/css/style.css" type="text/css" rel="stylesheet" media="screen,projection" />
  <script src="/extras/video.js"></script>
  <link href="/css/video-js.css" rel="stylesheet" />
  <script src="/extras/videojs-abloop.min.js" ></script>
  <link href="/css/label.css" rel="stylesheet"></link>
</head>
<body>
  <div id="contextMenu" class="context-menu" style="display:none">
    <ul>
    </ul>
  </div>

  <div id="contextMenu2" class="context-menu" style="display:none">
    <ul>
      <li class="hoverable gray" onclick="playVideo();"><a style="color:black;">Play Selected Clip (G)</a></li>
      <li class="hoverable gray" onclick="deleteTags('all');"><a style="color:black;">Remove All Anno</a></li>
      <!-- per-entity "Remove ... Anno" items are inserted here by init_tags() -->
    </ul>
  </div>

  <div class="videobackground">
    <div class='videobox'>
      <video id="vid" controls class="video-js" muted>
        <source src="https://vjs.zencdn.net/v/oceans.mp4" type='video/mp4'>
      </video>
    </div>
  </div>

  <div class="box">
    <div class="topbar">
      <div>
        <button class="btn" onclick="backtoindex();"> Back </button>
        <label class="btn">
            <input type="file" id="file-input" />
            <span>Open Annotation</span>
        </label>
        <button class="btn" id="undobtn" onclick="undo();" style='visibility:hidden' oncontextmenu="showUndoMenu(event);"> ← </button>
        <button class="btn" id="redobtn" onclick="redo();" style='visibility:hidden' oncontextmenu="showRedoMenu(event);"> → </button>
      </div>
      <div>
        <h4 id="title" style='font-size: calc(80% + 1vw);'>title</h4>
      </div>
      <div class="todo">
        <span class='new badge' id="selectedbatch" style="visibility: hidden;margin:auto; margin-right:10px; font-size:20px; height:40px; width:150px;align-items: center;display:flex;justify-content: center" data-badge-caption=''>0 Selected</span>
        <div class="input-field" style="margin:auto;height:36px;">
          <select>
            <option value="8">Column: 8</option>
            <option value="7">Column: 7</option>
            <option value="6">Column: 6</option>
            <option value="5">Column: 5</option>
            <option value="4" selected>Column: 4</option>
            <option value="3">Column: 3</option>
            <option value="2">Column: 2</option>
          </select>
        </div>
        <button class="btn" onclick="deleteTags('all');"> Delete Tags (Del) </button>
        <button class="btn" onclick="save();"> SAVE (Ctrl+S) </button>
      </div>
    </div>
    <div class="main">
      <div class="tagLeft" style="overflow-y: hidden;">
        <div class="leftTop">
          <ul class="imagerow" id="row" style="height:100%">
          </ul>
        </div>
        <div class="leftBottom" style="width=100%;z-index: 400;display:none;">
          <div class='row' style="height: 35px;">
            <div class='col s3' style="margin-left: 0px">
              <div class="switch">
                <label>
                  Intersection
                  <input type="checkbox" onchange="delete_tag_switch(this);">
                  <span class="lever"></span>
                  Union
                </label>
              </div>
            </div>
            <div class='col s8' style="margin-left: 0px">
              Delete Tags (R)
            </div>
          </div>
          <div id='deletetag_buttons'>
          </div>

        </div>
      </div>
      <div class="tagRight">
        <div id="label-table-tab" class="row imagerow" style="min-height: 48px; padding:0;">
          <ul class="tabs">
            <li class="tab col s6">
              <a href="#addatag">Add</a>
            </li>
            <li class="tab col s6">
              <a href="#labels">Annotations</a>
            </li>
          </ul>
        </div>

        <div id="addatag" class="col s12">
          <div class="row imagerow">
            <div class="col s12" style="padding:0">
              <!-- one tab per entity is inserted here by init_tags() -->
              <ul class="tabs" id="entity_tabs"></ul>
            </div>
          </div>

          <div class="info top">
            <!-- one content panel per entity is inserted here by init_tags() -->
            <div class="row imagerow" id="entity_tab_content" style="padding:0"></div>
          </div>

          <div class="footer">
            <div class="row imagerow">
              <div class="col s12" style="display:flex;">
              <div class="col s12" style="display:flex;">
                <button class='btn' style="margin: auto;flex-grow: 1; margin-bottom:8px" onclick="updateAnnotationBulk();">Add Labels (Enter or SpaceBar)</button>
              </div>
            </div>
          </div>
        </div>

        <div id="labels" class="col s12">
          <div class="info annotationpanel">
            <table>
              <thead>
                <tr>
                  <th>Duration</th>
                  <th>Label</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>


  <script>
  
  let video_name = "<?= $name; ?>";
  let video_cnt = <?= $video_cnt; ?>;
  let mp4_loc = '<?= $mp4_loc; ?>';
  let webp_loc = '<?= $webp_loc; ?>';
  let labels = <?= json_encode($row); ?>;
  let start_time = parseInt('<?= $start_time; ?>');
  let end_time = parseInt('<?= $end_time; ?>');
  let user_video_index = '<?= $user_video_index;?>';
  let original_name = '<?= $original_name; ?>';
  let user_id = '<?= $id; ?>';
  
  
  </script>
  <!--  Scripts-->
  <script src="/extras/jquery-2.1.1.min.js"></script>
  <script src="/extras/materialize.js"></script>
  <script src="/extras/FileSaver.js"></script>
  <script src="/extras/split.js"></script>
  <script src='js/label.js'></script>

</body>

</html>
