<?php
   ob_start();
   session_start();

   require_once './util.php';
   require_once './conn.php';
?>

<?
   // error_reporting(E_ALL);
   // ini_set("display_errors", 1);
?>

<html lang = "en">
   
   <head>
      <title>Log-in</title>
      <link href = "css/bootstrap.min.css" rel = "stylesheet">
      
      <link href="css/materialize.css" type="text/css" rel="stylesheet" media="screen,projection" />
   </head>
        
   <body>
      
      <div class = "container" style='margin-top:20vh'>
         <h2 style='text-align: center;'>BWC Annotation</h2> 
         <div class = "">
            
            <?php
               $msg = '';
               
               if (isset($_POST['login']) && !empty($_POST['username']) 
                  && !empty($_POST['password'])) {

                  if (login($_POST['username'], $_POST['password'])){

                     header("location: index.php");

                  } else {
                     $msg = 'Wrong username or password';
                  }
               }
            ?>
         </div> <!-- /container -->
         
         <div class='row'>

            <div class='col s4 offset-s4'>
            
               <form class = "form-signin" role = "form" 
                  action = "<?php echo htmlspecialchars($_SERVER['PHP_SELF']); 
                  ?>" method = "post">
                  <input type = "text" class = "form-control" 
                     name = "username" placeholder = "username" 
                     required autofocus></br>
                  <input type = "password" class = "form-control"
                     name = "password" placeholder = "password" required>
                  <button class = "btn btn-lg btn-primary btn-block" type = "submit" 
                     name = "login">Login</button>
               </form>
               <h5 class = "form-signin-heading" style="color: red;"><?php echo $msg; ?></h5>


            </div>
         </div>
            
      </div> 
      
   </body>
</html>