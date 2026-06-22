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

  $setting = $_POST['setting'];

  foreach($_POST['data'] as $assigned_query){
    $current_id_index = $assigned_query['id'];


    if(strcmp($setting, 'remove')==0){
      db_exec("DELETE FROM user_video WHERE user_idx=?", "i", $current_id_index);
    }

    if (array_key_exists('assign_query', $assigned_query)) {

      // Build parameterized placeholder groups + bound values for the
      // INSERT (3-tuples) and the optional DELETE (2-tuples).
      $insert_groups = array(); $insert_types = ''; $insert_params = array();
      $where_groups  = array(); $where_types  = ''; $where_params  = array();
      foreach($assigned_query['assign_query'] as $val) {
          $insert_groups[] = "(?, ?, ?)";
          $insert_types   .= "iii";
          array_push($insert_params, $current_id_index, $val['video_id'], $val['label_index']);

          $where_groups[] = "(?, ?)";
          $where_types   .= "ii";
          array_push($where_params, $current_id_index, $val['video_id']);
      }

      if (count($insert_groups) == 0) {
        continue;
      }

      if(strcmp($setting, 'leave')==0){
        db_exec("DELETE FROM user_video WHERE (user_idx, video_idx) IN (".implode(", ", $where_groups).")",
          $where_types, ...$where_params);
      }

      db_exec("INSERT INTO user_video (user_idx, video_idx, label_group_idx) VALUES ".implode(", ", $insert_groups),
        $insert_types, ...$insert_params);
    }

  }
  echo 'New Assignment Successful';
?>
