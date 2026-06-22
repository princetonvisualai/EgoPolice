<?php

    error_reporting(E_ALL);
    ini_set("display_errors", 1);
    ini_set('display_startup_errors', 1);
    function generateRandomString($length = 10) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    // Return the logged-in user's id from the server-side session,
    // or FALSE if not logged in. (Callers must have called session_start().)
    function get_session_id(){
        return isset($_SESSION['user_id']) ? $_SESSION['user_id'] : FALSE;
    }

    function login($id, $password) {
        global $connect;

        $result = db_select("SELECT id, password FROM user WHERE id=?", "s", $id);
        $row=mysqli_fetch_assoc($result);


        if(mysqli_num_rows($result) == 1)
        {
            if (password_verify($password, $row['password'])) {

                // prevent session fixation, then store the logged-in id server-side
                session_regenerate_id(true);
                $_SESSION['user_id'] = $row['id'];

                return TRUE;
            }
        }

        return FALSE;
    }

?>