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

   

   $sql="SELECT id, `index` FROM user WHERE role='annotator'";
   $result=mysqli_query($connect,$sql);
   $row=mysqli_fetch_all($result,MYSQLI_ASSOC);


   $sql="SELECT `name`, `mp4_location`, `second`, `index` FROM video WHERE original=1";
   $result=mysqli_query($connect,$sql);
   $row_videos=mysqli_fetch_all($result,MYSQLI_ASSOC);
   
   $sql="SELECT A.name, A.mp4_location, A.second, A.start_time, A.end_time, A.index, B.name AS original_name
   FROM video A, video B 
   WHERE A.original=0 AND A.original_index=B.index";
   $result=mysqli_query($connect,$sql);
   $row_videos_partial=mysqli_fetch_all($result,MYSQLI_ASSOC);

   $sql="SELECT DISTINCT(group_index), `name` FROM label_group ORDER BY group_index";
   $result=mysqli_query($connect,$sql);
   $row_group_indices = mysqli_fetch_all($result,MYSQLI_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0" />
  <title>Annotation Tool - Manage</title>

  <!-- CSS  -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link href="css/materialize.css" type="text/css" rel="stylesheet" media="screen,projection" />
  <link href="css/style.css" type="text/css" rel="stylesheet" media="screen,projection" />
  <link href="css/manage.css" type="text/css" rel="stylesheet" />
  <style>
  </style>
</head>

<body>
  <header>
    <ul id="slide-out" class="sidenav sidenav-fixed" style="z-index: 50;">
      <li><a href="logout.php" class='btn'> Log Out </a></li>
      <li><a onclick="overview();"> Manage Videos </a></li>
      <li><a onclick="manage_labels();"> Manage Labels </a></li>
      <?php foreach($row as $key=>$value): ?>
      <li><a onclick="leftselect(this);" class='user_btn' id='<?= $value['id']; ?>' style="display:inline;">id: <?= $value['id']; ?></a>
      </li>
      <?php endforeach; ?>
      <li><button onclick="newaccount();">Create New Account</button></li>
    </ul>

  </header>
  <div class="loading hidden" id="loadingpage">
    <div class='uil-ring-css' style='transform:scale(0.79);'>
        <div></div>
    </div>
  </div>

  <div class='alertbackground' style="z-index: 100;">
    <div class='alertbox'>
      <div class='alertinner' id='alertmain'>
        You can add new partial videos by uploading a txt file. The txt format is as follows:

        <pre>
          original_videoname, start_second, end_second (, unique_video_name (optional))
        </pre>
        Both seconds are end-inclusive, starting from 0. Add more lines to add more. If a unique video name is not given,
        we use original_videoname_startsecond_endsecond as the default.

        </br>
        e.g.,

        <pre>
1081642/177637825, 0, 100, 1081642/177637825_0_100
1081642/177637825, 0, 150, hello123
1081642/177637825, 0, 10</pre>


        <label class="btn">
          <input type="file" id="upload-partial-input" />
          <span>Upload and Preview</span>
        </label>
      </div>
      <div class='alertinner' id='alertsub' style=''>
        <div></div>
        <button class="btn" onclick="submitpartialvideos()">Submit </button>
      </div>
      <div class='alertinner' id="alertlabelpreview" style="">
        <div style='margin:auto; width:300px; height:80%;background-color: white;'>
          <div class="row">
            <div class="input-field col 6">
              <input id="labelgroupname" type="text" class="validate">
              <label for="labelgroupname" class='active'>Label Name</label>
              <span class="helper-textid"></span>
            </div>
          </div>
          <div class="row imagerow" id='tabbuttonall' style='margin-bottom: 0;'>
            <div class="col s12" style="padding:0">
              <ul class="tabs" id="preview_tabs"></ul>
            </div>
          </div>

          <div class="info top" style="">
            <div class="row imagerow" id="preview_tab_content" style="padding:0"></div>
          </div>
        </div>

        <button class='btn' onclick='submitlabels();'>Submit</button>

      </div>
      <div class='alertinner' id="alertassignment" style="">

        <div class="row">
        You can assign in bulk. Press Download here to preview how the files should look, then upload to submit.

        <pre>
The format is user_id, video_id, label_group_id (which you can check from the Manage Labels tab)
or
user_id, video_id,                  <------ an empty label group id removes the assignment for that video id.
        </pre>
        </div>
        <div class="row">
          <button class="btn" onclick="save_bulk_assignment_template();">
            Download template
          </button>
        </br>
          <button class="btn" onclick="save_current_annotation();">
            Download current annotation for everyone
          </button>
        </br>
          <label class="btn">
            <input type="file" id="upload-assignment-remove" />
            <span>Upload</span>
          </label>
          (remove unmentioned assignment). This only affects the user IDs that were mentioned.
        </br>
          <label class="btn">
            <input type="file" id="upload-assignment-leave" />
            <span>Upload</span>
          </label>
          (leave unmentioned assignment)


        </div>
      </div>
    </div>
  </div>

  <main>
    <div class="container overview" id="manage_individual" style="display:none">
      <div class="row">
        <div class="col s10">
          <h5> Profile </h5>
        </div>
        <div class="col s2">
          <button class='btn' onclick="deleteaccount();"> Delete </button>
        </div>
      </div>
      <div class='row'>

        <div class="input-field col 6">
          <input id="changeId" type="text" class="validate">
          <label for="changeId" class='active'>id</label>
          <span class="helper-textid"></span>
        </div>
        <div class='col s6'>
          <button class='btn' onclick="ChangeId();"> Save </button>
        </div>

      </div>
      <div class='row'>
        <div class="input-field col s6 m4 l4">
          <input id="password" type="text" class="validate">
          <label for="password" class='active'>Password</label>
          <span class="helper-text"></span>
        </div>
        <div class='col s6'>
          <button class='btn' onclick="generateRandom();"> Random </button>
          <button class='btn' onclick="passwordSave();"> Save </button>
        </div>
      </div>
      <div class="row">
        <div class="input-field col s12">
          <textarea id="textarea1" class="materialize-textarea"></textarea>
          <label for="textarea1">Note (only visible to admin)</label>
        </div>
        <div class="row">
          <button class='btn' onclick="updatenote();"> Save Note </button>
        </div>
      </div>

      <div class="row">
        <div class="col s12">
          <ul class="tabs">
            <li class="tab col s5"><a class="active" href="#test1">Original</a></li>
            <li class="tab col s5"><a href="#test2">Partial</a></li>
          </ul>
        </div>
        <div id="test1">
        <select class="browser-default" onchange='manage_individual("original");' id='manage_individual_original_select'>
            <?php for($i = 0; $i < ceil(count($row_videos)/100.0); $i += 1): ?>
              <option value="<?= $i; ?>">Page <?= $i+1; ?> (<? echo $row_videos[$i*100]['name']; ?> to <? echo $row_videos[min($i*100+99, count($row_videos)-1 )]['name']; ?>)</option>
            <?php endfor; ?>
          </select>

          <div id='manage_individual_original'>

          </div>
        </div>
        <div id="test2">

                    
          <select class="browser-default" onchange='manage_individual("partial");' id='manage_individual_partial_select'>
            <?php for($i = 0; $i < ceil(count($row_videos_partial)/100.0); $i += 1): ?>
              <option value="<?= $i; ?>">Page <?= $i+1; ?> (<? echo $row_videos_partial[$i*100]['name']; ?> to <? echo $row_videos_partial[min($i*100+99, count($row_videos_partial)-1 )]['name']; ?>) </option>
            <?php endfor; ?>
          </select>
          <div id='manage_individual_partial'>

          </div>

        </div>
      </div>


      <div class="fixed-action-btn">
        <a class="btn-floating btn-large red">
          <i class="large material-icons" onclick="save_assignment();">save</i>
        </a>
        <a class="btn-floating btn-large red">
          <i class="large material-icons" onclick="save_assignment_bulk();">+</i>
        </a>
      </div>
    </div>
    <div class="container overview" id="manage_video" style="display:block">
      <div class="row">
        <div class="col s12">
          <ul class="tabs">
            <li class="tab col s6"><a class="active" href="#overview1">Original</a></li>
            <li class="tab col s6"><a href="#overview2">Partial</a></li>
          </ul>
        </div>
        <div id="overview1">
          Original Videos are fixed and are not removable.
          
          <select class="browser-default" onchange='manage_original();' id='manage_video_original_select'>
            <?php for($i = 0; $i < ceil(count($row_videos)/100.0); $i += 1): ?>
              <option value="<?= $i; ?>">Page <?= $i+1; ?> (<? echo $row_videos[$i*100]['name']; ?> to <? echo $row_videos[min($i*100+99, count($row_videos)-1 )]['name']; ?>)</option>
            <?php endfor; ?>
          </select>
          <div id='manage_video_original'>

          </div>

        </div>
        <div id="overview2">
          You can add new partial videos. Removing is possible if the partial video is not assigned to anyone.
          But let's try not to remove too much because I am not sure of the consequences of deleted video.

          <button class='btn' onclick="show_bulkupload();">Bulk Upload</button>

          <select class="browser-default" onchange='manage_partial();' id='manage_video_partial_select'>
            <?php for($i = 0; $i < ceil(count($row_videos_partial)/100.0); $i += 1): ?>
              <option value="<?= $i; ?>">Page <?= $i+1; ?> (<? echo $row_videos_partial[$i*100]['name']; ?> to <? echo $row_videos_partial[min($i*100+99, count($row_videos_partial)-1 )]['name']; ?>) </option>
            <?php endfor; ?>
          </select>
          <div id='manage_video_partial'>

          </div>
        </div>
      </div>
    </div>


    <div class="container overview" id="manage_label" style="display: none;">
      Here we list all the labels. You can delete a label group if no one is assigned to it, but you CANNOT modify it.



      <?php foreach($row_group_indices as $key=>$value): ?>

        <div class='card' onclick="togglelabel(this);" style="cursor:pointer">
          <span><? echo $value['group_index']; ?>,<? echo $value['name']; ?></span>
          <div class='hidden inner'>
            <?php
              $gi = $value['group_index'];
              $eres = db_select(
                "SELECT label.entity, MIN(label.`index`) AS minidx FROM label
                INNER JOIN label_group ON label.`index`=label_group.label_index
                WHERE label_group.group_index=? GROUP BY label.entity ORDER BY minidx", "i", $gi);
              $group_entities = mysqli_fetch_all($eres, MYSQLI_ASSOC);
            ?>
            <?php foreach ($group_entities as $ent):
                    $entity_name = $ent['entity'];
            ?>
              </br><span><?php echo htmlspecialchars($entity_name); ?></span></br>
              <?php
              $result = db_select(
              "SELECT label.index, label.description, label.entity, label.name, label.order, label.skip, label.under, label.explicit FROM label
              INNER JOIN label_group ON label.index=label_group.label_index WHERE label_group.group_index=? AND label.under=0 AND label.entity=? ORDER BY label.order", "is", $gi, $entity_name);
              $row_labels = mysqli_fetch_all($result,MYSQLI_ASSOC);
              ?>
              <?php foreach($row_labels as $label): ?>
                <span>
                  <? echo $label['name'];?>, <? echo $label['description'];?> <? if($label['skip']==1){echo ', skip';}?> <? if($label['explicit']==1){echo ', explicit';}?>
                </span>
                </br>

                <?
                  $result = db_select(
                  "SELECT label.index, label.description, label.entity, label.name, label.order, label.skip, label.under, label.explicit FROM label
                  INNER JOIN label_group ON label.index=label_group.label_index WHERE label_group.group_index=? AND label.under=? AND label.entity=? ORDER BY label.order", "iis", $gi, $label['index'], $entity_name);
                  $row_labels_child = mysqli_fetch_all($result,MYSQLI_ASSOC);
                ?>
                <? foreach($row_labels_child as $label_child): ?>

                  <span>
                  --<? echo $label_child['name'];?>, <? echo $label_child['description'];?> <? if($label_child['skip']==1){echo ', skip';}?> <? if($label_child['explicit']==1){echo ', explicit';}?>
                  </span>
                  </br>
                <? endforeach;?>
              <?php endforeach; ?>
            <?php endforeach;?>
          </div>
        </div>
      <?php endforeach; ?>

      <div style="border: solid 2px; padding: 10px;">
        <div class="row">
          <p>New Label Group</p>
          <p>Start each entity with a <code>#</code> header line, then list its labels below it, one per line:</p>
          <pre># Entity Name
name, description, (skip), (only explicit)</pre>
          Don't use commas in the description. <code>skip</code> is 1 if the checkbox should be disabled
          (e.g. a parent/header row), 0 otherwise. <code>(only explicit)</code> is 1 to make it explicit-only.
          The last two are optional and default to 0. Use <code>--</code> prefix for a child label (one level deep).
        </div>
        <div class="row">
          <textarea rows="14" style="resize: vertical; height:22rem; width:100%;" id="labeltextarea"># Bodycam Wearer
Physical Interaction, This is description for PI, 1, 1
--Handcuffing, act of handcuffing, 0, 1
Running, act of running, 0, 1

# Target Civilian
Compliant, the civilian is compliant, 0, 1</textarea>
          <button class="btn" onclick="previewlabel();">Preview</button>
        </div>
      </div>
    </div>


  </main>

  <!--  Scripts-->
  <script>
    var videos_original = <?php echo json_encode($row_videos); ?>;
    var videos_partial = <?php echo json_encode($row_videos_partial); ?>;
    var videos = videos_original.concat(videos_partial) ;
    var label_groups= <?php echo json_encode($row_group_indices); ?>;
    var users = <?php echo json_encode($row); ?>;
  </script>
  <script src="/extras/jquery-2.1.1.min.js"></script>
  <script src="/extras/materialize.js"></script>
  <script src="/extras/nouislider.js"></script>
  <script src="/extras/FileSaver.js"></script>
  <script src='js/manage.js'></script>
</body>

</html>