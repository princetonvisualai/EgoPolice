<?php
    function mysqli_field_name($result, $field_offset)
    {
        $properties = mysqli_fetch_field_direct($result, $field_offset);
        return is_object($properties) ? $properties->name : null;
    }
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

   

   if (array_key_exists('who', $_POST)){
    $export = db_select("SELECT * FROM `movement` WHERE user=?", "s", $_POST['who']);
   } else {
    $export = db_select("SELECT * FROM `movement`");
   }
   $data="";
   $header="";
   $fields = mysqli_num_fields ( $export );
    for ( $i = 0; $i < $fields; $i++ )
    {
        $header .= mysqli_field_name( $export , $i ) . ",";
    }

    while( $row = mysqli_fetch_row( $export ) )
    {
        $line = '';
        foreach( $row as $value )
        {                                            
            if ( ( !isset( $value ) ) || ( $value == "" ) )
            {
                $value = ",";
            }
            else
            {
                $value = str_replace( '"' , '""' , $value );
                $value = '"' . $value . '"' . ",";
            }
            $line .= $value;
        }
        $data .= trim( $line ) . "\n";
    }
    $data = str_replace( "\r" , "" , $data );

    print "$header\n$data";
   
?>  