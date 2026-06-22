<?php
/**
 * Configuration template.
 *
 * Copy this file to config.php and fill in your real values:
 *
 *     cp config.example.php config.php
 *
 * config.php is gitignored and must NEVER be committed (it holds secrets).
 */
return [
    // Database connection
    'db_host' => 'localhost',
    'db_user' => 'your_db_user',
    'db_pass' => 'your_db_password',
    'db_name' => 'annotation_tool',

    // Set true only in development. When false, errors are logged, not shown.
    'debug' => false,
];
