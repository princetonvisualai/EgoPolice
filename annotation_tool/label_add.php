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

   $sql = "SELECT COALESCE(MAX(group_index), 0) AS group_index FROM label_group";
   $result=mysqli_query($connect,$sql);
   $row=mysqli_fetch_all($result,MYSQLI_ASSOC);

   $new_group_index = $row[0]['group_index'] + 1;

   $local_to_global_index = array();
   foreach ($_POST['data'] as $key=>$label){
    
    $under = 0;
    if ($label['under'] != -1){
      $under = $local_to_global_index[$label['under']];
    }

    $entity      = htmlspecialchars($label['entity']);
    $description = htmlspecialchars($label['description']);
    $name        = $label['name'];
    $order       = (int)$label['order'];
    // skip/explicit arrive as JS booleans ("true"/"false"); normalize to 1/0.
    $skip     = ($label['skip'] === true     || $label['skip'] === 'true'     || $label['skip'] === '1'     || $label['skip'] === 1)     ? 1 : 0;
    $explicit = ($label['explicit'] === true || $label['explicit'] === 'true' || $label['explicit'] === '1' || $label['explicit'] === 1) ? 1 : 0;

    db_exec("INSERT INTO `label`(`description`, `entity`, `name`, `order`, `skip`, `under`, `explicit`) VALUES (?, ?, ?, ?, ?, ?, ?)",
        "sssiiii", $description, $entity, $name, $order, $skip, $under, $explicit);

    $last_id = mysqli_insert_id($connect);
    $local_to_global_index[$key] = $last_id;

    db_exec("INSERT INTO `label_group`(`group_index`, `label_index`, `name`) VALUES (?, ?, ?)",
        "iis", $new_group_index, $last_id, $_POST['name']);
   }

   echo "Added Successfully.";
   exit;

?>